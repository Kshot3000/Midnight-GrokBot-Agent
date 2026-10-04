#!/usr/bin/env node
/**
 * Local ZK prove for hello `increment` or `recordNote` against proof-server on :6300.
 *
 * Uses compact-runtime circuit execution + proofDataIntoSerializedPreimage,
 * then midnight-js httpClientProvingProvider → POST /check + /prove.
 *
 * recordNote needs a host witness localNote(): Bytes<32> (explicit disclosure).
 * The note itself is not written; Compact disclose()s a domain-separated hash.
 * Compiled keys for recordNote exist only after `npm run compact:hello`.
 *
 * Does NOT need a funded wallet.
 * Does NOT submit to Preprod. Does NOT deploy. LOCAL-TRUE.
 */
import { pathToFileURL } from 'node:url';
import * as RT from '@midnight-ntwrk/compact-runtime';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { httpClientProvingProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

import { HELLO_OUT, HELLO_CONTRACT } from './paths.mjs';
import { PREPROD } from './preprod-config.mjs';
import { requireHelloArtifactsOrExit } from './check-artifacts.mjs';
import { probeProofServer } from './providers.mjs';
import { banner, section, kv, ok, fail, warn, brandLine, printJson } from './cli-format.mjs';
import { writeLastProveJson, HELLO_LAST_PROVE_STUDIO_PATH, HELLO_LAST_PROVE_TMP_PATH } from './last-prove-writer.mjs';

const DEFAULT_CIRCUIT = 'increment';
export const HELLO_CIRCUITS = Object.freeze(['increment', 'recordNote']);
export const EMPTY_NOTE = new Uint8Array(32);
const PROOF_URL = process.env.MIDNIGHT_PROOF_SERVER || PREPROD.proofServer;
const TIMEOUT_MS = Number(process.env.MIDNIGHT_PROVE_TIMEOUT_MS || 180_000);

/** Success criteria (documented for consumers + CI). */
export const SUCCESS_CRITERIA = Object.freeze({
  proofServerHealth: 'GET /health → HTTP 200 + status ok',
  greetings: 'off-chain increment transitions 0 → 1',
  recordNote:
    'localNote witness Bytes<32> non-empty; noteCount 0 → 1; lastNoteHash disclosed, note stays private',
  preimage: 'proofDataIntoSerializedPreimage yields Uint8Array length > 0',
  check: 'POST /check returns array (binding slots)',
  prove: 'POST /prove returns Uint8Array proofBytes > 0 (hello increment typical ~2940)',
  claim: 'local ZK only — NOT a Preprod deploy / NOT on-chain',
});

/**
 * Accept increment (default) or recordNote. Unknown names fail closed.
 * @param {string} [name]
 */
export function resolveHelloCircuit(name) {
  const circuit = name || DEFAULT_CIRCUIT;
  if (!HELLO_CIRCUITS.includes(circuit)) {
    const err = new Error(
      `Unknown hello circuit "${circuit}". Known: ${HELLO_CIRCUITS.join(', ')}`,
    );
    err.code = 'UNKNOWN_CIRCUIT';
    throw err;
  }
  return circuit;
}

/**
 * Normalize a private note to Bytes<32>. Rejects the empty pad the circuit asserts against.
 * @param {Uint8Array | string} note
 */
export function normalizeHelloNote(note) {
  let bytes;
  if (note instanceof Uint8Array) {
    bytes = note;
  } else if (typeof note === 'string') {
    const hex = note.startsWith('0x') ? note.slice(2) : note;
    if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
      const err = new Error('local note must be 32 bytes (64 hex chars)');
      err.code = 'EMPTY_NOTE';
      throw err;
    }
    bytes = Uint8Array.from(Buffer.from(hex, 'hex'));
  } else {
    const err = new Error('local note must be Uint8Array or 32-byte hex');
    err.code = 'EMPTY_NOTE';
    throw err;
  }
  if (bytes.byteLength !== 32 || bytes.every((b) => b === 0)) {
    const err = new Error('local note must be non-empty Bytes<32>');
    err.code = 'EMPTY_NOTE';
    throw err;
  }
  return bytes;
}

/**
 * Compact witness provider for localNote(). Same tuple shape as escrow localSecretKey:
 * [nextPrivateState, witnessBytes]. The note is not copied onto the ledger.
 * @param {Uint8Array | string} note
 */
export function makeHelloNoteWitnesses(note) {
  const noteBytes = normalizeHelloNote(note);
  return {
    localNote(ctx) {
      return [ctx.privateState, noteBytes];
    },
  };
}

function parseCliCircuit() {
  const arg = process.argv.find((a) => a.startsWith('--circuit='));
  if (arg) return arg.slice('--circuit='.length);
  const i = process.argv.indexOf('--circuit');
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  return process.env.HELLO_PROVE_CIRCUIT || DEFAULT_CIRCUIT;
}

function parseCliNote() {
  const arg = process.argv.find((a) => a.startsWith('--note='));
  if (arg) return arg.slice('--note='.length);
  const i = process.argv.indexOf('--note');
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  return process.env.HELLO_NOTE_HEX || null;
}

/**
 * Run local prove. Returns a JSON-serializable report.
 * Throws on hard failures (caller maps to exit codes).
 * opts.circuit: 'increment' (default) | 'recordNote'
 * opts.note: Bytes<32> or 64-char hex, required for recordNote (lab default if omitted on CLI only).
 */
export async function proveHelloLocal(opts = {}) {
  const proofUrl = opts.proofUrl || PROOF_URL;
  const timeout = opts.timeout ?? TIMEOUT_MS;
  const circuit = resolveHelloCircuit(opts.circuit);

  requireHelloArtifactsOrExit();

  const health = await probeProofServer(proofUrl);
  if (!health.ok) {
    const err = new Error(`proof-server unhealthy at ${proofUrl}: ${health.body}`);
    err.code = 'PROOF_SERVER_DOWN';
    err.health = health;
    throw err;
  }

  // Network id affects address encoding samples; proving itself is local.
  setNetworkId(PREPROD.networkId);

  const note =
    circuit === 'recordNote'
      ? normalizeHelloNote(opts.note || '01'.repeat(32))
      : null;
  const witnesses = circuit === 'recordNote' ? makeHelloNoteWitnesses(note) : {};
  const { Contract, ledger } = await import(pathToFileURL(HELLO_CONTRACT).href);
  const contract = new Contract(witnesses);

  if (circuit === 'recordNote' && typeof contract.impureCircuits?.recordNote !== 'function') {
    const err = new Error(
      'compiled hello contract has no recordNote — re-run npm run compact:hello (Compact ~0.31.1). LOCAL-TRUE, not deployed.',
    );
    err.code = 'ARTIFACTS_STALE';
    throw err;
  }

  const COIN = '0'.repeat(64);
  const ADDR = RT.sampleContractAddress();
  const privateState = {};

  const ctor = contract.initialState(RT.createConstructorContext(privateState, COIN));
  const ctx0 = RT.createCircuitContext(ADDR, COIN, ctor.currentContractState, privateState);
  const before = ledger(ctx0.currentQueryContext.state);
  const call =
    circuit === 'recordNote'
      ? contract.impureCircuits.recordNote(ctx0)
      : contract.impureCircuits.increment(ctx0);
  const after = ledger(call.context.currentQueryContext.state);

  if (circuit === 'increment' && after.greetings !== before.greetings + 1n) {
    throw new Error(
      `unexpected greetings transition ${before.greetings} → ${after.greetings}`,
    );
  }
  if (circuit === 'recordNote') {
    const beforeCount = before.noteCount ?? 0n;
    const afterCount = after.noteCount;
    if (afterCount !== beforeCount + 1n) {
      throw new Error(
        `unexpected noteCount transition ${beforeCount} → ${afterCount}`,
      );
    }
    const hash = after.lastNoteHash;
    const hashBytes = hash instanceof Uint8Array ? hash : Uint8Array.from(hash || []);
    if (hashBytes.byteLength !== 32 || hashBytes.every((b) => b === 0)) {
      throw new Error('recordNote did not disclose a non-empty lastNoteHash');
    }
  }

  const pd = call.proofData;
  const preimage = RT.proofDataIntoSerializedPreimage(
    pd.input,
    pd.output,
    pd.publicTranscript,
    pd.privateTranscriptOutputs,
    circuit,
  );

  const zk = new NodeZkConfigProvider(HELLO_OUT);
  const zkCfg = await zk.get(circuit);
  const prover = httpClientProvingProvider(proofUrl, zk, { timeout });

  const tCheck = Date.now();
  const checkResult = await prover.check(preimage, circuit);
  const checkMs = Date.now() - tCheck;

  const tProve = Date.now();
  const proof = await prover.prove(preimage, circuit);
  const proveMs = Date.now() - tProve;

  if (!(proof instanceof Uint8Array) || proof.byteLength < 1) {
    throw new Error('prove returned empty proof');
  }

  return {
    claim: 'local ZK prove against proof-server — NOT a Preprod deploy',
    ok: true,
    circuit,
    proofServer: proofUrl,
    health: { status: health.status, body: health.body },
    greetings: { before: String(before.greetings), after: String(after.greetings) },
    noteCount:
      circuit === 'recordNote'
        ? { before: String(before.noteCount ?? 0n), after: String(after.noteCount) }
        : null,
    witness:
      circuit === 'recordNote'
        ? {
            kind: 'localNote Bytes<32>',
            emptyRejected: true,
            noteOnLedger: false,
            fundedWallet: false,
          }
        : { kind: 'none', fundedWallet: false },
    preimageBytes: preimage.byteLength,
    checkLen: Array.isArray(checkResult) ? checkResult.length : null,
    checkMs,
    proofBytes: proof.byteLength,
    proveMs,
    zkArtifacts: {
      proverKeyBytes: zkCfg.proverKey?.byteLength ?? zkCfg.proverKey?.length ?? null,
      verifierKeyBytes: zkCfg.verifierKey?.byteLength ?? zkCfg.verifierKey?.length ?? null,
      zkirBytes: zkCfg.zkir?.byteLength ?? zkCfg.zkir?.length ?? null,
    },
    successCriteria: SUCCESS_CRITERIA,
    apiPath: {
      serialize: 'compact-runtime / onchain-runtime-v3 proofDataIntoSerializedPreimage(input,output,publicTranscript,privateTranscriptOutputs,keyLocation)',
      provider: 'httpClientProvingProvider(url, NodeZkConfigProvider(HELLO_OUT))',
      witness: circuit === 'recordNote' ? 'Contract({ localNote })' : 'Contract({})',
      endpoints: ['POST /check', 'POST /prove'],
      notUsed: ['walletProvider', 'midnightProvider', 'deployContract', 'proveTx (tx-level)'],
    },
  };
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const circuit = parseCliCircuit();
  const noteArg = parseCliNote();
  banner('preprod-hello-stub · prove hello local', {
    claim: 'ZK prove vs localhost:6300 — NOT a Preprod deploy',
  });

  section('Target');
  kv('proofServer', PROOF_URL);
  kv('circuit', circuit);
  kv('timeoutMs', TIMEOUT_MS);
  kv('helloOut', HELLO_OUT);
  if (circuit === 'recordNote') kv('note', noteArg ? 'cli hex' : 'lab default 0x01*32');

  try {
    const report = await proveHelloLocal({
      circuit,
      note: noteArg || undefined,
    });
    section('Result');
    kv('circuit', report.circuit);
    kv('greetings', `${report.greetings.before} → ${report.greetings.after}`);
    if (report.noteCount) kv('noteCount', `${report.noteCount.before} → ${report.noteCount.after}`);
    kv('preimage', `${report.preimageBytes} bytes`);
    kv('check', `len=${report.checkLen} · ${report.checkMs} ms`);
    kv('proof', `${report.proofBytes} bytes · ${report.proveMs} ms`);
    kv('proverKey', report.zkArtifacts.proverKeyBytes);
    kv('verifierKey', report.zkArtifacts.verifierKeyBytes);
    ok('local prove succeeded (off-chain ZK only)');
    section('Success criteria');
    for (const [k, v] of Object.entries(SUCCESS_CRITERIA)) kv(k, v);
    const written = writeLastProveJson(report, { source: `prove:hello-local circuit=${report.circuit}`, kind: 'hello' });
    section('Studio last-prove.json');
    kv('studio', written.studioPath || HELLO_LAST_PROVE_STUDIO_PATH);
    kv('tmp', written.tmpPath || HELLO_LAST_PROVE_TMP_PATH);
    kv('written', (written.written || []).join(' · ') || 'none');
    kv('hint', 'Hello Studio #local-prove · prove-bridge :6399 POST /prove?contract=hello');
    printJson(report);
    brandLine();
    process.exit(0);
  } catch (e) {
    if (e?.code === 'PROOF_SERVER_DOWN') {
      fail(e.message);
      warn('Start: podman run -d --name midnight-proof-server -p 6300:6300 \\');
      warn('  docker.io/midnightntwrk/proof-server:8.1.0 midnight-proof-server -v');
      warn('Or: npm run proof-server:podman');
      brandLine();
      process.exit(3);
    }
    if (e?.code === 'ARTIFACTS_STALE') {
      fail(e.message);
      warn('recordNote is source-level until compact:hello regenerates keys. LOCAL-TRUE.');
      brandLine();
      process.exit(2);
    }
    fail(String(e?.message || e));
    if (e?.stack) console.error(e.stack);
    brandLine();
    process.exit(1);
  }
}
