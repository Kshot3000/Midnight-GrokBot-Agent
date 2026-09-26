#!/usr/bin/env node
/**
 * Local ZK prove for agent-escrow impure circuits against proof-server on :6300.
 *
 * Uses synthetic lab secrets as Compact `localSecretKey` witnesses for
 * client / agent / approver roles (NOT a funded wallet / NOT Lace / NOT on-chain).
 *
 * Default path = multi-step happy lifecycle (initialize → … → settle).
 * Does NOT submit to Preprod. Does NOT deploy.
 */
import { randomBytes } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import * as RT from '@midnight-ntwrk/compact-runtime';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { httpClientProvingProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

import { ESCROW_OUT, ESCROW_CONTRACT, ESCROW_CIRCUITS } from './paths.mjs';
import { PREPROD } from './preprod-config.mjs';
import { requireEscrowArtifactsOrExit } from './check-escrow-artifacts.mjs';
import { probeProofServer } from './providers.mjs';
import { banner, section, kv, ok, fail, warn, brandLine, printJson } from './cli-format.mjs';

const PROOF_URL = process.env.MIDNIGHT_PROOF_SERVER || PREPROD.proofServer;
const TIMEOUT_MS = Number(process.env.MIDNIGHT_PROVE_TIMEOUT_MS || 180_000);

/** Named multi-step paths. Each step: { name, role, args(secrets) → circuit args[] }. */
export const ESCROW_PROVE_PATHS = Object.freeze({
  initialize: Object.freeze([
    { name: 'initialize', role: 'client', args: (s) => [s.agentCommitment, s.approverCommitment] },
  ]),
  happy: Object.freeze([
    { name: 'initialize', role: 'client', args: (s) => [s.agentCommitment, s.approverCommitment] },
    { name: 'addMilestone', role: 'client', args: () => [100n, 999_999n] },
    { name: 'fund', role: 'client', args: () => [100n] },
    { name: 'start', role: 'client', args: () => [] },
    { name: 'submitProof', role: 'agent', args: (s) => [1n, s.proofHash] },
    { name: 'approve', role: 'approver', args: () => [1n] },
    { name: 'settle', role: 'client', args: () => [] },
  ]),
  reject: Object.freeze([
    { name: 'initialize', role: 'client', args: (s) => [s.agentCommitment, s.approverCommitment] },
    { name: 'addMilestone', role: 'client', args: () => [50n, 999n] },
    { name: 'fund', role: 'client', args: () => [50n] },
    { name: 'start', role: 'client', args: () => [] },
    { name: 'submitProof', role: 'agent', args: (s) => [1n, s.proofHash] },
    { name: 'reject', role: 'approver', args: () => [1n] },
    { name: 'settle', role: 'client', args: () => [] },
  ]),
  'dispute-refund': Object.freeze([
    { name: 'initialize', role: 'client', args: (s) => [s.agentCommitment, s.approverCommitment] },
    { name: 'addMilestone', role: 'client', args: () => [50n, 999n] },
    { name: 'fund', role: 'client', args: () => [50n] },
    { name: 'start', role: 'client', args: () => [] },
    { name: 'dispute', role: 'client', args: () => [] },
    { name: 'resolveDisputeRefund', role: 'client', args: () => [] },
  ]),
  'dispute-resume': Object.freeze([
    { name: 'initialize', role: 'client', args: (s) => [s.agentCommitment, s.approverCommitment] },
    { name: 'addMilestone', role: 'client', args: () => [50n, 999n] },
    { name: 'fund', role: 'client', args: () => [50n] },
    { name: 'start', role: 'client', args: () => [] },
    { name: 'dispute', role: 'client', args: () => [] },
    { name: 'resolveDisputeResume', role: 'client', args: () => [] },
  ]),
  cancel: Object.freeze([
    { name: 'initialize', role: 'client', args: (s) => [s.agentCommitment, s.approverCommitment] },
    { name: 'fund', role: 'client', args: () => [25n] },
    { name: 'cancel', role: 'client', args: () => [] },
  ]),
});

/** All 12 impure circuit names covered across the named paths. */
export const ESCROW_MULTI_COVERED = Object.freeze([
  'initialize',
  'addMilestone',
  'fund',
  'start',
  'submitProof',
  'approve',
  'reject',
  'dispute',
  'resolveDisputeRefund',
  'resolveDisputeResume',
  'settle',
  'cancel',
]);

/** Success criteria (documented for consumers + CI). */
export const ESCROW_SUCCESS_CRITERIA = Object.freeze({
  proofServerHealth: 'GET /health → HTTP 200 + status ok',
  artifacts: '12 impure circuits with keys/ + zkir/ under managed/agent-escrow',
  witness:
    'synthetic localSecretKey(): Bytes<32> per role (client/agent/approver lab RNG — not a funded wallet)',
  initialize: 'clientPk/agentPk/approverPk set; agent ≠ client ≠ empty',
  multiPath:
    'default path=happy proves initialize→addMilestone→fund→start→submitProof→approve→settle',
  preimage: 'proofDataIntoSerializedPreimage yields Uint8Array length > 0 per step',
  check: 'POST /check returns array (binding slots) per step',
  prove: 'POST /prove returns Uint8Array proofBytes > 0 (escrow typical ~4508) per step',
  claim: 'local ZK only — NOT a Preprod deploy / NOT on-chain',
  zswap: 'agent-escrow fund() is ledger Uint only — no Coin/Zswap receive required for local prove',
});

/**
 * Exact requirements for local escrow prove.
 * Documented so consumers know what blocks on-chain vs what local multi-prove covers.
 */
export const ESCROW_WITNESS_REQUIREMENTS = Object.freeze({
  localProveMulti: {
    needs: [
      'Compiled managed artifacts (npm run compact:escrow)',
      'proof-server :6300 healthy',
      'Synthetic sk_client / sk_agent / sk_approver (Bytes<32> lab RNG)',
      'Witness localSecretKey swaps secret by privateState.activeRole',
      'Chain ChargedState via call.context.currentQueryContext.state between steps',
    ],
    doesNotNeed: [
      'Funded Preprod wallet / tDUST / Lace',
      'walletProvider / midnightProvider',
      'deployContract / proveTx',
      'Real Zswap coins (fund amount is a ledger Uint in this skeleton)',
    ],
  },
  roleByCircuit: Object.freeze({
    initialize: 'client',
    addMilestone: 'client',
    fund: 'client',
    start: 'client',
    dispute: 'client',
    resolveDisputeRefund: 'client',
    resolveDisputeResume: 'client',
    settle: 'client',
    cancel: 'client',
    submitProof: 'agent',
    approve: 'approver|client',
    reject: 'approver|client',
  }),
  blockedCircuits: Object.freeze({
    note: 'None of the 12 impure circuits are blocked for local prove — all covered by named paths',
    coinZswap: 'N/A for this skeleton (no receive/send Coin circuits)',
    onChainStillNeeds: 'Funded Preprod wallet + tDUST + walletProvider / midnightProvider + deployContract / proveTx',
  }),
  pureCircuitsNoZkKeys: {
    circuits: ['roleCommitment', 'clientTag', 'agentTag', 'approverTag'],
    note: 'Exported helpers only — no .prover/.zkir; cannot POST /prove for these',
  },
  impureCircuitsWithZkKeys: ESCROW_CIRCUITS,
  namedPaths: Object.keys(ESCROW_PROVE_PATHS),
});

/**
 * Build synthetic role secrets + commitments via pureCircuits (off-chain helpers).
 * @param {{ clientSk?: Uint8Array, agentSk?: Uint8Array, approverSk?: Uint8Array, pureCircuits: { clientTag(): Uint8Array, agentTag(): Uint8Array, approverTag(): Uint8Array, roleCommitment(sk: Uint8Array, tag: Uint8Array): Uint8Array } }} opts
 */
export function makeEscrowLabSecrets(opts) {
  const { pureCircuits } = opts;
  const clientSk = opts.clientSk ?? randomBytes(32);
  const agentSk = opts.agentSk ?? randomBytes(32);
  const approverSk = opts.approverSk ?? randomBytes(32);
  const clientTag = pureCircuits.clientTag();
  const agentTag = pureCircuits.agentTag();
  const approverTag = pureCircuits.approverTag();
  return {
    clientSk,
    agentSk,
    approverSk,
    client: clientSk,
    agent: agentSk,
    approver: approverSk,
    clientCommitment: pureCircuits.roleCommitment(clientSk, clientTag),
    agentCommitment: pureCircuits.roleCommitment(agentSk, agentTag),
    approverCommitment: pureCircuits.roleCommitment(approverSk, approverTag),
    proofHash: opts.proofHash ?? randomBytes(32),
  };
}

/**
 * Role-swapping witness factory. privateState.activeRole selects which lab secret returns.
 */
export function makeRoleWitnesses(secrets) {
  return {
    localSecretKey(ctx) {
      const role = ctx.privateState?.activeRole || 'client';
      const sk =
        role === 'agent'
          ? secrets.agentSk
          : role === 'approver'
            ? secrets.approverSk
            : secrets.clientSk;
      return [{ ...ctx.privateState, activeRole: role }, sk];
    },
  };
}

function parseCliPath() {
  const arg = process.argv.find((a) => a.startsWith('--path='));
  if (arg) return arg.slice('--path='.length);
  const i = process.argv.indexOf('--path');
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  // Legacy: --circuit=initialize maps to path initialize
  const circ = process.argv.find((a) => a.startsWith('--circuit='));
  if (circ) {
    const c = circ.slice('--circuit='.length);
    if (c === 'initialize') return 'initialize';
  }
  return process.env.ESCROW_PROVE_PATH || 'happy';
}

/**
 * Prove one circuit step against the proof-server.
 */
async function proveOneStep({
  name,
  role,
  invoke,
  contract,
  ADDR,
  stateBlob,
  zswapLocal,
  prover,
  zk,
}) {
  const privateState = { activeRole: role };
  const ctx = RT.createCircuitContext(ADDR, zswapLocal || '0'.repeat(64), stateBlob, privateState);
  const call = invoke(ctx);
  const nextState = call.context.currentQueryContext.state;
  const nextZswap = call.context.currentZswapLocalState;
  const pd = call.proofData;
  if (!pd) throw new Error(`${name}: no proofData`);

  const preimage = RT.proofDataIntoSerializedPreimage(
    pd.input,
    pd.output,
    pd.publicTranscript,
    pd.privateTranscriptOutputs,
    name,
  );

  const zkCfg = await zk.get(name);
  const tCheck = Date.now();
  const checkResult = await prover.check(preimage, name);
  const checkMs = Date.now() - tCheck;
  const tProve = Date.now();
  const proof = await prover.prove(preimage, name);
  const proveMs = Date.now() - tProve;

  if (!(proof instanceof Uint8Array) || proof.byteLength < 1) {
    throw new Error(`${name}: prove returned empty proof`);
  }

  return {
    step: {
      circuit: name,
      role,
      ok: true,
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
    },
    nextState,
    nextZswap,
    call,
  };
}

/**
 * Multi-step local prove for a named path (or custom steps).
 * @param {{ path?: string, steps?: Array, proofUrl?: string, timeout?: number, secrets?: object }} opts
 */
export async function proveEscrowMultiLocal(opts = {}) {
  const proofUrl = opts.proofUrl || PROOF_URL;
  const timeout = opts.timeout ?? TIMEOUT_MS;
  const pathName = opts.path || 'happy';

  const stepsDef = opts.steps || ESCROW_PROVE_PATHS[pathName];
  if (!stepsDef) {
    const err = new Error(
      `Unknown escrow prove path "${pathName}". Known: ${Object.keys(ESCROW_PROVE_PATHS).join(', ')}`,
    );
    err.code = 'UNKNOWN_PATH';
    throw err;
  }

  requireEscrowArtifactsOrExit();

  const health = await probeProofServer(proofUrl);
  if (!health.ok) {
    const err = new Error(`proof-server unhealthy at ${proofUrl}: ${health.body}`);
    err.code = 'PROOF_SERVER_DOWN';
    err.health = health;
    throw err;
  }

  setNetworkId(PREPROD.networkId);

  const { Contract, ledger, pureCircuits } = await import(pathToFileURL(ESCROW_CONTRACT).href);
  const secrets = opts.secrets || makeEscrowLabSecrets({ pureCircuits });
  const witnesses = makeRoleWitnesses(secrets);
  const contract = new Contract(witnesses);

  const COIN = '0'.repeat(64);
  const ADDR = RT.sampleContractAddress();
  const ctor = contract.initialState(
    RT.createConstructorContext({ activeRole: 'client' }, COIN),
  );
  let stateBlob = ctor.currentContractState;
  let zswapLocal = ctor.currentZswapLocalState;

  const zk = new NodeZkConfigProvider(ESCROW_OUT);
  const prover = httpClientProvingProvider(proofUrl, zk, { timeout });

  const steps = [];
  let lastLedger = null;

  for (const def of stepsDef) {
    const args = def.args(secrets);
    const result = await proveOneStep({
      name: def.name,
      role: def.role,
      invoke: (ctx) => contract.impureCircuits[def.name](ctx, ...args),
      contract,
      ADDR,
      stateBlob,
      zswapLocal,
      prover,
      zk,
    });
    stateBlob = result.nextState;
    zswapLocal = result.nextZswap;
    lastLedger = ledger(result.call.context.currentQueryContext.state);
    steps.push({
      ...result.step,
      ledgerState: Number(lastLedger.state),
      funded: String(lastLedger.funded),
      released: String(lastLedger.released),
      refunded: String(lastLedger.refunded),
    });
  }

  const circuitsProved = steps.map((s) => s.circuit);
  const clientHex = Buffer.from(lastLedger.clientPk).toString('hex');
  const agentHex = Buffer.from(lastLedger.agentPk).toString('hex');

  return {
    claim: 'local ZK multi-circuit prove against proof-server — NOT a Preprod deploy',
    ok: true,
    path: pathName,
    contract: 'agent-escrow',
    proofServer: proofUrl,
    health: { status: health.status, body: health.body },
    circuitsProved,
    stepCount: steps.length,
    steps,
    ledger: {
      stateAfter: Number(lastLedger.state),
      clientPkPrefix: clientHex.slice(0, 16),
      agentPkPrefix: agentHex.slice(0, 16),
      funded: String(lastLedger.funded),
      released: String(lastLedger.released),
      refunded: String(lastLedger.refunded),
      sequence: String(lastLedger.sequence),
    },
    witness: {
      kind: 'synthetic lab RNG Bytes<32> × {client,agent,approver}',
      fundedWallet: false,
      roleSwap: 'privateState.activeRole selects secret',
      note: 'localSecretKey witness only — NOT Lace / NOT Preprod seed',
    },
    coverage: {
      impureWithZkKeys: ESCROW_CIRCUITS.length,
      coveredByNamedPaths: ESCROW_MULTI_COVERED.length,
      thisPath: circuitsProved,
      blockedByCoinZswap: [],
    },
    successCriteria: ESCROW_SUCCESS_CRITERIA,
    witnessRequirements: ESCROW_WITNESS_REQUIREMENTS,
    apiPath: {
      serialize:
        'compact-runtime proofDataIntoSerializedPreimage(input,output,publicTranscript,privateTranscriptOutputs,keyLocation)',
      provider: 'httpClientProvingProvider(url, NodeZkConfigProvider(ESCROW_OUT))',
      endpoints: ['POST /check', 'POST /prove'],
      chaining: 'createCircuitContext(addr, zswapLocal, ChargedState, {activeRole})',
      notUsed: ['walletProvider', 'midnightProvider', 'deployContract', 'proveTx (tx-level)'],
    },
  };
}

/**
 * Backward-compatible single-circuit (or multi-path) entry.
 * opts.circuit='initialize' → path initialize; opts.path overrides; default path=happy.
 */
export async function proveEscrowLocal(opts = {}) {
  if (opts.circuit && opts.circuit !== 'initialize' && !opts.path) {
    // Allow single-circuit only for initialize (safe start); others go through multi paths
    if (!ESCROW_PROVE_PATHS[opts.circuit] && opts.circuit !== 'initialize') {
      const err = new Error(
        `Single-circuit prove for "${opts.circuit}" is not exposed. ` +
          `Use path=happy|reject|dispute-refund|dispute-resume|cancel|initialize. ` +
          `See ESCROW_PROVE_PATHS / ESCROW_WITNESS_REQUIREMENTS.`,
      );
      err.code = 'CIRCUIT_NOT_SUPPORTED';
      throw err;
    }
  }
  const path =
    opts.path ||
    (opts.circuit === 'initialize' ? 'initialize' : undefined) ||
    'happy';
  return proveEscrowMultiLocal({ ...opts, path });
}

/**
 * Prove every named path sequentially (covers all 12 impure circuits).
 * Heavier smoke — used by vitest optionally / CLI --path=all.
 */
export async function proveEscrowAllPathsLocal(opts = {}) {
  const pathNames = Object.keys(ESCROW_PROVE_PATHS).filter((p) => p !== 'initialize');
  // initialize is a prefix of every other path; skip standalone to save time unless requested
  const reports = [];
  for (const path of pathNames) {
    reports.push(await proveEscrowMultiLocal({ ...opts, path }));
  }
  const circuits = new Set();
  for (const r of reports) for (const c of r.circuitsProved) circuits.add(c);
  return {
    claim: 'local ZK all-paths prove against proof-server — NOT a Preprod deploy',
    ok: reports.every((r) => r.ok),
    paths: reports.map((r) => ({
      path: r.path,
      stepCount: r.stepCount,
      circuitsProved: r.circuitsProved,
      totalProveMs: r.steps.reduce((a, s) => a + s.proveMs, 0),
    })),
    circuitsCovered: [...circuits].sort(),
    coveredCount: circuits.size,
    expectedImpure: ESCROW_CIRCUITS.length,
    allImpureCovered: ESCROW_CIRCUITS.every((c) => circuits.has(c)),
    blockedByCoinZswap: [],
    witness: { fundedWallet: false },
  };
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const pathName = parseCliPath();

  banner('preprod-hello-stub · prove escrow local', {
    claim: 'ZK multi-circuit prove vs localhost:6300 — NOT a Preprod deploy',
  });

  section('Target');
  kv('proofServer', PROOF_URL);
  kv('path', pathName);
  kv('timeoutMs', TIMEOUT_MS);
  kv('escrowOut', ESCROW_OUT);
  kv('circuits', `${ESCROW_CIRCUITS.length} impure with ZK keys`);
  kv('namedPaths', Object.keys(ESCROW_PROVE_PATHS).join(', '));

  try {
    if (pathName === 'all') {
      const report = await proveEscrowAllPathsLocal();
      section('All-paths result');
      for (const p of report.paths) {
        kv(p.path, `${p.stepCount} steps · ${p.circuitsProved.join('→')} · ${p.totalProveMs} ms`);
      }
      kv('circuitsCovered', `${report.coveredCount}/${report.expectedImpure}`);
      kv('allImpureCovered', report.allImpureCovered);
      kv('blockedByCoinZswap', '[] (none)');
      ok('local escrow all-paths prove succeeded (off-chain ZK only)');
      printJson(report);
      brandLine();
      process.exit(report.ok && report.allImpureCovered ? 0 : 1);
    }

    const report = await proveEscrowMultiLocal({ path: pathName });
    section('Result');
    kv('path', report.path);
    kv('steps', report.stepCount);
    kv('circuits', report.circuitsProved.join(' → '));
    kv('clientPk', `${report.ledger.clientPkPrefix}…`);
    kv('agentPk', `${report.ledger.agentPkPrefix}…`);
    kv('ledgerState', report.ledger.stateAfter);
    kv('funded/released/refunded', `${report.ledger.funded}/${report.ledger.released}/${report.ledger.refunded}`);
    section('Per-step proofs');
    for (const s of report.steps) {
      kv(
        s.circuit,
        `role=${s.role} · proof=${s.proofBytes} B · ${s.proveMs} ms · state=${s.ledgerState}`,
      );
    }
    ok(`local escrow path=${pathName} prove succeeded (off-chain ZK only)`);
    section('Witness note');
    kv('kind', report.witness.kind);
    kv('fundedWallet', report.witness.fundedWallet);
    kv('roleSwap', report.witness.roleSwap);
    section('Coverage');
    kv('blockedByCoinZswap', '[] — fund() is ledger Uint only');
    kv('onChainStillNeeds', ESCROW_WITNESS_REQUIREMENTS.blockedCircuits.onChainStillNeeds);
    section('Success criteria');
    for (const [k, v] of Object.entries(ESCROW_SUCCESS_CRITERIA)) kv(k, v);
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
