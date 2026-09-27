#!/usr/bin/env node
/**
 * Local ZK prove for hello `increment` against proof-server on :6300.
 *
 * Uses compact-runtime circuit execution + proofDataIntoSerializedPreimage,
 * then midnight-js httpClientProvingProvider → POST /check + /prove.
 *
 * Does NOT need a funded wallet.
 * Does NOT submit to Preprod. Does NOT deploy.
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

const CIRCUIT = 'increment';
const PROOF_URL = process.env.MIDNIGHT_PROOF_SERVER || PREPROD.proofServer;
const TIMEOUT_MS = Number(process.env.MIDNIGHT_PROVE_TIMEOUT_MS || 180_000);

/** Success criteria (documented for consumers + CI). */
export const SUCCESS_CRITERIA = Object.freeze({
  proofServerHealth: 'GET /health → HTTP 200 + status ok',
  greetings: 'off-chain increment transitions 0 → 1',
  preimage: 'proofDataIntoSerializedPreimage yields Uint8Array length > 0',
  check: 'POST /check returns array (binding slots)',
  prove: 'POST /prove returns Uint8Array proofBytes > 0 (hello typical ~2940)',
  claim: 'local ZK only — NOT a Preprod deploy / NOT on-chain',
});

/**
 * Run local prove. Returns a JSON-serializable report.
 * Throws on hard failures (caller maps to exit codes).
 */
export async function proveHelloLocal(opts = {}) {
  const proofUrl = opts.proofUrl || PROOF_URL;
  const timeout = opts.timeout ?? TIMEOUT_MS;

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

  const { Contract, ledger } = await import(pathToFileURL(HELLO_CONTRACT).href);
  const contract = new Contract({});
  const COIN = '0'.repeat(64);
  const ADDR = RT.sampleContractAddress();
  const privateState = {};

  const ctor = contract.initialState(RT.createConstructorContext(privateState, COIN));
  const ctx0 = RT.createCircuitContext(ADDR, COIN, ctor.currentContractState, privateState);
  const before = ledger(ctx0.currentQueryContext.state);
  const call = contract.impureCircuits.increment(ctx0);
  const after = ledger(call.context.currentQueryContext.state);

  if (after.greetings !== before.greetings + 1n) {
    throw new Error(
      `unexpected greetings transition ${before.greetings} → ${after.greetings}`,
    );
  }

  const pd = call.proofData;
  const preimage = RT.proofDataIntoSerializedPreimage(
    pd.input,
    pd.output,
    pd.publicTranscript,
    pd.privateTranscriptOutputs,
    CIRCUIT,
  );

  const zk = new NodeZkConfigProvider(HELLO_OUT);
  const zkCfg = await zk.get(CIRCUIT);
  const prover = httpClientProvingProvider(proofUrl, zk, { timeout });

  const tCheck = Date.now();
  const checkResult = await prover.check(preimage, CIRCUIT);
  const checkMs = Date.now() - tCheck;

  const tProve = Date.now();
  const proof = await prover.prove(preimage, CIRCUIT);
  const proveMs = Date.now() - tProve;

  if (!(proof instanceof Uint8Array) || proof.byteLength < 1) {
    throw new Error('prove returned empty proof');
  }

  return {
    claim: 'local ZK prove against proof-server — NOT a Preprod deploy',
    ok: true,
    circuit: CIRCUIT,
    proofServer: proofUrl,
    health: { status: health.status, body: health.body },
    greetings: { before: String(before.greetings), after: String(after.greetings) },
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
      endpoints: ['POST /check', 'POST /prove'],
      notUsed: ['walletProvider', 'midnightProvider', 'deployContract', 'proveTx (tx-level)'],
    },
  };
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  banner('preprod-hello-stub · prove hello local', {
    claim: 'ZK prove vs localhost:6300 — NOT a Preprod deploy',
  });

  section('Target');
  kv('proofServer', PROOF_URL);
  kv('circuit', CIRCUIT);
  kv('timeoutMs', TIMEOUT_MS);
  kv('helloOut', HELLO_OUT);

  try {
    const report = await proveHelloLocal();
    section('Result');
    kv('greetings', `${report.greetings.before} → ${report.greetings.after}`);
    kv('preimage', `${report.preimageBytes} bytes`);
    kv('check', `len=${report.checkLen} · ${report.checkMs} ms`);
    kv('proof', `${report.proofBytes} bytes · ${report.proveMs} ms`);
    kv('proverKey', report.zkArtifacts.proverKeyBytes);
    kv('verifierKey', report.zkArtifacts.verifierKeyBytes);
    ok('local prove succeeded (off-chain ZK only)');
    section('Success criteria');
    for (const [k, v] of Object.entries(SUCCESS_CRITERIA)) kv(k, v);
    const written = writeLastProveJson(report, { source: 'prove:hello-local', kind: 'hello' });
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
    fail(String(e?.message || e));
    if (e?.stack) console.error(e.stack);
    brandLine();
    process.exit(1);
  }
}
