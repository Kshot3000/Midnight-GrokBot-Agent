import { describe, it, expect } from 'vitest';
import {
  ESCROW_SUCCESS_CRITERIA,
  ESCROW_WITNESS_REQUIREMENTS,
  ESCROW_PROVE_PATHS,
  ESCROW_MULTI_COVERED,
  makeEscrowLabSecrets,
  makeRoleWitnesses,
  proveEscrowLocal,
  proveEscrowMultiLocal,
  proveEscrowAllPathsLocal,
} from '../src/prove-escrow-local.mjs';
import { probeProofServer } from '../src/providers.mjs';
import { PREPROD } from '../src/preprod-config.mjs';
import { inspectEscrowArtifacts } from '../src/check-escrow-artifacts.mjs';
import { ESCROW_CIRCUITS } from '../src/paths.mjs';
import { pathToFileURL } from 'node:url';
import { ESCROW_CONTRACT } from '../src/paths.mjs';

describe('prove-escrow-local docs', () => {
  it('documents required criteria keys', () => {
    expect(ESCROW_SUCCESS_CRITERIA.proofServerHealth).toMatch(/health/);
    expect(ESCROW_SUCCESS_CRITERIA.prove).toMatch(/prove/);
    expect(ESCROW_SUCCESS_CRITERIA.claim).toMatch(/NOT a Preprod deploy/);
    expect(ESCROW_SUCCESS_CRITERIA.witness).toMatch(/localSecretKey/);
    expect(ESCROW_SUCCESS_CRITERIA.multiPath).toMatch(/happy/);
    expect(ESCROW_SUCCESS_CRITERIA.zswap).toMatch(/ledger Uint/);
  });

  it('lists 12 impure circuits and named paths covering all of them', () => {
    expect(ESCROW_CIRCUITS).toHaveLength(12);
    expect(ESCROW_WITNESS_REQUIREMENTS.impureCircuitsWithZkKeys).toEqual([
      ...ESCROW_CIRCUITS,
    ]);
    expect(ESCROW_WITNESS_REQUIREMENTS.pureCircuitsNoZkKeys.circuits).toContain(
      'roleCommitment',
    );
    expect(
      ESCROW_WITNESS_REQUIREMENTS.localProveMulti.doesNotNeed.join(' '),
    ).toMatch(/funded/i);
    expect(ESCROW_MULTI_COVERED).toHaveLength(12);
    for (const c of ESCROW_CIRCUITS) {
      expect(ESCROW_MULTI_COVERED).toContain(c);
    }
    expect(Object.keys(ESCROW_PROVE_PATHS)).toEqual(
      expect.arrayContaining([
        'initialize',
        'happy',
        'reject',
        'dispute-refund',
        'dispute-resume',
        'cancel',
      ]),
    );
    expect(ESCROW_WITNESS_REQUIREMENTS.blockedCircuits.coinZswap).toMatch(/N\/A/);
    expect(ESCROW_WITNESS_REQUIREMENTS.blockedCircuits.note).toMatch(/None of the 12/);
  });
});

describe('escrow artifacts gate', () => {
  it('finds managed tree when compact:escrow has been run', () => {
    const r = inspectEscrowArtifacts();
    if (!r.ok) {
      console.warn('skip — escrow artifacts missing; run npm run compact:escrow');
      return;
    }
    expect(r.circuitCount).toBe(12);
    expect(r.circuits).toContain('initialize');
    expect(r.circuits).toContain('submitProof');
  });
});

describe('makeEscrowLabSecrets + role witnesses', () => {
  it('derives distinct role commitments via pureCircuits', async () => {
    const arts = inspectEscrowArtifacts();
    if (!arts.ok) {
      console.warn('skip secrets — escrow artifacts missing');
      return;
    }
    const { pureCircuits } = await import(pathToFileURL(ESCROW_CONTRACT).href);
    const s = makeEscrowLabSecrets({ pureCircuits });
    expect(s.clientSk).toHaveLength(32);
    expect(s.agentCommitment).toHaveLength(32);
    expect(Buffer.from(s.clientCommitment).equals(Buffer.from(s.agentCommitment))).toBe(
      false,
    );
    expect(
      Buffer.from(s.agentCommitment).equals(Buffer.from(s.approverCommitment)),
    ).toBe(false);
    const w = makeRoleWitnesses(s);
    const [ps, skClient] = w.localSecretKey({ privateState: { activeRole: 'client' } });
    const [, skAgent] = w.localSecretKey({ privateState: { activeRole: 'agent' } });
    const [, skApprover] = w.localSecretKey({ privateState: { activeRole: 'approver' } });
    expect(ps.activeRole).toBe('client');
    expect(Buffer.from(skClient).equals(Buffer.from(s.clientSk))).toBe(true);
    expect(Buffer.from(skAgent).equals(Buffer.from(s.agentSk))).toBe(true);
    expect(Buffer.from(skApprover).equals(Buffer.from(s.approverSk))).toBe(true);
  });
});

describe('prove-escrow-local live (optional)', () => {
  it('proves initialize-only path against local proof-server when healthy', async () => {
    const arts = inspectEscrowArtifacts();
    if (!arts.ok) {
      console.warn('skip live escrow prove — artifacts missing');
      return;
    }
    const health = await probeProofServer(PREPROD.proofServer);
    if (!health.ok) {
      console.warn('skip live escrow prove — proof-server down:', health.body);
      return;
    }
    const report = await proveEscrowLocal({ path: 'initialize', timeout: 180_000 });
    expect(report.ok).toBe(true);
    expect(report.path).toBe('initialize');
    expect(report.circuitsProved).toEqual(['initialize']);
    expect(report.steps[0].proofBytes).toBeGreaterThan(100);
    expect(report.witness.fundedWallet).toBe(false);
    expect(report.claim).toMatch(/NOT a Preprod deploy/);
  }, 200_000);

  it('proves multi-step happy path (7 circuits) with synthetic role secrets', async () => {
    const arts = inspectEscrowArtifacts();
    if (!arts.ok) {
      console.warn('skip multi prove — artifacts missing');
      return;
    }
    const health = await probeProofServer(PREPROD.proofServer);
    if (!health.ok) {
      console.warn('skip multi prove — proof-server down:', health.body);
      return;
    }
    const report = await proveEscrowMultiLocal({ path: 'happy', timeout: 180_000 });
    expect(report.ok).toBe(true);
    expect(report.path).toBe('happy');
    expect(report.stepCount).toBe(7);
    expect(report.circuitsProved).toEqual([
      'initialize',
      'addMilestone',
      'fund',
      'start',
      'submitProof',
      'approve',
      'settle',
    ]);
    for (const s of report.steps) {
      expect(s.ok).toBe(true);
      expect(s.proofBytes).toBeGreaterThan(100);
      expect(s.preimageBytes).toBeGreaterThan(0);
    }
    // agent role used for submitProof
    expect(report.steps.find((s) => s.circuit === 'submitProof').role).toBe('agent');
    expect(report.steps.find((s) => s.circuit === 'approve').role).toBe('approver');
    expect(report.coverage.blockedByCoinZswap).toEqual([]);
    expect(report.witness.fundedWallet).toBe(false);
    expect(report.claim).toMatch(/NOT a Preprod deploy/);
  }, 300_000);

  it('proves cancel path (initialize→fund→cancel)', async () => {
    const arts = inspectEscrowArtifacts();
    if (!arts.ok) {
      console.warn('skip cancel prove — artifacts missing');
      return;
    }
    const health = await probeProofServer(PREPROD.proofServer);
    if (!health.ok) {
      console.warn('skip cancel prove — proof-server down:', health.body);
      return;
    }
    const report = await proveEscrowMultiLocal({ path: 'cancel', timeout: 180_000 });
    expect(report.ok).toBe(true);
    expect(report.circuitsProved).toEqual(['initialize', 'fund', 'cancel']);
    expect(report.steps.every((s) => s.ok)).toBe(true);
  }, 200_000);
});

describe('prove-escrow-all-paths live (optional heavy)', () => {
  it('covers all 12 impure circuits across named paths when ESCROW_PROVE_ALL=1', async () => {
    if (process.env.ESCROW_PROVE_ALL !== '1') {
      console.warn('skip all-paths — set ESCROW_PROVE_ALL=1 to run (~25s)');
      return;
    }
    const arts = inspectEscrowArtifacts();
    if (!arts.ok) {
      console.warn('skip all-paths — artifacts missing');
      return;
    }
    const health = await probeProofServer(PREPROD.proofServer);
    if (!health.ok) {
      console.warn('skip all-paths — proof-server down:', health.body);
      return;
    }
    const report = await proveEscrowAllPathsLocal({ timeout: 180_000 });
    expect(report.ok).toBe(true);
    expect(report.allImpureCovered).toBe(true);
    expect(report.coveredCount).toBe(12);
    expect(report.blockedByCoinZswap).toEqual([]);
    expect(report.witness.fundedWallet).toBe(false);
  }, 600_000);
});
