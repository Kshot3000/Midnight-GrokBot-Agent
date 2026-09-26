#!/usr/bin/env node
/**
 * Local ZK prove for agent-escrow `initialize` against proof-server on :6300.
 *
 * Uses synthetic lab secrets as the Compact `localSecretKey` witness
 * (NOT a funded wallet / NOT Lace / NOT on-chain).
 *
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

const CIRCUIT = 'initialize';
const PROOF_URL = process.env.MIDNIGHT_PROOF_SERVER || PREPROD.proofServer;
const TIMEOUT_MS = Number(process.env.MIDNIGHT_PROVE_TIMEOUT_MS || 180_000);

/** Success criteria (documented for consumers + CI). */
export const ESCROW_SUCCESS_CRITERIA = Object.freeze({
  proofServerHealth: 'GET /health → HTTP 200 + status ok',
  artifacts: '12 impure circuits with keys/ + zkir/ under managed/agent-escrow',
  witness: 'synthetic localSecretKey(): Bytes<32> (lab RNG — not a funded wallet)',
  initialize: 'clientPk/agentPk/approverPk set; agent ≠ client ≠ empty',
  preimage: 'proofDataIntoSerializedPreimage yields Uint8Array length > 0',
  check: 'POST /check returns array (binding slots)',
  prove: 'POST /prove returns Uint8Array proofBytes > 0 (initialize typical ~4508)',
  claim: 'local ZK only — NOT a Preprod deploy / NOT on-chain',
});

/**
 * Exact requirements for local escrow prove vs later lifecycle circuits.
 * Documented so consumers know what blocks a full 12-circuit smoke.
 */
export const ESCROW_WITNESS_REQUIREMENTS = Object.freeze({
  localProveInitialize: {
    needs: [
      'Compiled managed artifacts (npm run compact:escrow)',
      'proof-server :6300 healthy',
      'Witness localSecretKey → 32 random lab bytes (client role)',
      'Public agentCommitment + approverCommitment from pureCircuits.roleCommitment',
    ],
    doesNotNeed: [
      'Funded Preprod wallet / tDUST / Lace',
      'walletProvider / midnightProvider',
      'deployContract / proveTx',
    ],
  },
  laterCircuitsNeedMatchingSecrets: {
    note:
      'fund/addMilestone/start/dispute/settle/cancel assert client role; submitProof asserts agent; approve/reject assert approver|client',
    pattern:
      'Keep sk_client / sk_agent / sk_approver in privateState; swap localSecretKey return per call',
    blockedWithout: 'Role-matching Bytes<32> secrets that hash to the commitments registered at initialize',
  },
  pureCircuitsNoZkKeys: {
    circuits: ['roleCommitment', 'clientTag', 'agentTag', 'approverTag'],
    note: 'Exported helpers only — no .prover/.zkir; cannot POST /prove for these',
  },
  impureCircuitsWithZkKeys: ESCROW_CIRCUITS,
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
    clientCommitment: pureCircuits.roleCommitment(clientSk, clientTag),
    agentCommitment: pureCircuits.roleCommitment(agentSk, agentTag),
    approverCommitment: pureCircuits.roleCommitment(approverSk, approverTag),
  };
}

/**
 * Run local prove for escrow initialize. Returns a JSON-serializable report.
 */
export async function proveEscrowLocal(opts = {}) {
  const proofUrl = opts.proofUrl || PROOF_URL;
  const timeout = opts.timeout ?? TIMEOUT_MS;
  const circuit = opts.circuit || CIRCUIT;

  if (circuit !== 'initialize') {
    const err = new Error(
      `prove-escrow-local currently exercises "${CIRCUIT}" only (safe no-chain path). ` +
        `Requested "${circuit}". See ESCROW_WITNESS_REQUIREMENTS for later circuits.`,
    );
    err.code = 'CIRCUIT_NOT_SUPPORTED';
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

  const { Contract, ledger, pureCircuits, EscrowState } = await import(
    pathToFileURL(ESCROW_CONTRACT).href,
  );

  const secrets = makeEscrowLabSecrets({ pureCircuits });

  // Witness always returns client secret for initialize (assertIsClient path).
  const witnesses = {
    localSecretKey(ctx) {
      return [ctx.privateState, secrets.clientSk];
    },
  };

  const contract = new Contract(witnesses);
  const COIN = '0'.repeat(64);
  const ADDR = RT.sampleContractAddress();
  const privateState = { role: 'client-lab' };

  const ctor = contract.initialState(RT.createConstructorContext(privateState, COIN));
  const ctx0 = RT.createCircuitContext(ADDR, COIN, ctor.currentContractState, privateState);
  const before = ledger(ctx0.currentQueryContext.state);

  if (before.state !== EscrowState.CREATED) {
    throw new Error(`expected CREATED, got state=${before.state}`);
  }

  const call = contract.impureCircuits.initialize(
    ctx0,
    secrets.agentCommitment,
    secrets.approverCommitment,
  );
  const after = ledger(call.context.currentQueryContext.state);

  const clientHex = Buffer.from(after.clientPk).toString('hex');
  const agentHex = Buffer.from(after.agentPk).toString('hex');
  const expectedClient = Buffer.from(secrets.clientCommitment).toString('hex');
  const expectedAgent = Buffer.from(secrets.agentCommitment).toString('hex');

  if (clientHex !== expectedClient) {
    throw new Error('clientPk mismatch after initialize');
  }
  if (agentHex !== expectedAgent) {
    throw new Error('agentPk mismatch after initialize');
  }
  if (clientHex === agentHex) {
    throw new Error('agent and client commitments must differ');
  }
  if (Buffer.from(after.clientPk).every((b) => b === 0)) {
    throw new Error('client commitment must be non-empty');
  }

  const pd = call.proofData;
  if (!pd) throw new Error('initialize returned no proofData');

  const preimage = RT.proofDataIntoSerializedPreimage(
    pd.input,
    pd.output,
    pd.publicTranscript,
    pd.privateTranscriptOutputs,
    circuit,
  );

  const zk = new NodeZkConfigProvider(ESCROW_OUT);
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
    contract: 'agent-escrow',
    proofServer: proofUrl,
    health: { status: health.status, body: health.body },
    ledger: {
      stateBefore: before.state,
      stateAfter: after.state,
      clientPkPrefix: clientHex.slice(0, 16),
      agentPkPrefix: agentHex.slice(0, 16),
      sequence: String(after.sequence),
    },
    witness: {
      kind: 'synthetic lab RNG Bytes<32>',
      fundedWallet: false,
      note: 'localSecretKey witness only — NOT Lace / NOT Preprod seed',
    },
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
    successCriteria: ESCROW_SUCCESS_CRITERIA,
    witnessRequirements: ESCROW_WITNESS_REQUIREMENTS,
    apiPath: {
      serialize:
        'compact-runtime proofDataIntoSerializedPreimage(input,output,publicTranscript,privateTranscriptOutputs,keyLocation)',
      provider: 'httpClientProvingProvider(url, NodeZkConfigProvider(ESCROW_OUT))',
      endpoints: ['POST /check', 'POST /prove'],
      notUsed: ['walletProvider', 'midnightProvider', 'deployContract', 'proveTx (tx-level)'],
    },
  };
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  banner('preprod-hello-stub · prove escrow local', {
    claim: 'ZK prove vs localhost:6300 — NOT a Preprod deploy',
  });

  section('Target');
  kv('proofServer', PROOF_URL);
  kv('circuit', CIRCUIT);
  kv('timeoutMs', TIMEOUT_MS);
  kv('escrowOut', ESCROW_OUT);
  kv('circuits', `${ESCROW_CIRCUITS.length} impure with ZK keys`);

  try {
    const report = await proveEscrowLocal();
    section('Result');
    kv('clientPk', `${report.ledger.clientPkPrefix}…`);
    kv('agentPk', `${report.ledger.agentPkPrefix}…`);
    kv('sequence', report.ledger.sequence);
    kv('preimage', `${report.preimageBytes} bytes`);
    kv('check', `len=${report.checkLen} · ${report.checkMs} ms`);
    kv('proof', `${report.proofBytes} bytes · ${report.proveMs} ms`);
    kv('proverKey', report.zkArtifacts.proverKeyBytes);
    kv('verifierKey', report.zkArtifacts.verifierKeyBytes);
    ok('local escrow initialize prove succeeded (off-chain ZK only)');
    section('Witness note');
    kv('kind', report.witness.kind);
    kv('fundedWallet', report.witness.fundedWallet);
    section('Success criteria');
    for (const [k, v] of Object.entries(ESCROW_SUCCESS_CRITERIA)) kv(k, v);
    section('Later circuits (not proved here)');
    kv(
      'need',
      ESCROW_WITNESS_REQUIREMENTS.laterCircuitsNeedMatchingSecrets.blockedWithout,
    );
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
