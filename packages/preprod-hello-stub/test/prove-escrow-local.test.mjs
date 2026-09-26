import { describe, it, expect } from 'vitest';
import {
  ESCROW_SUCCESS_CRITERIA,
  ESCROW_WITNESS_REQUIREMENTS,
  makeEscrowLabSecrets,
  proveEscrowLocal,
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
  });

  it('lists 12 impure circuits and pure helpers without ZK keys', () => {
    expect(ESCROW_CIRCUITS).toHaveLength(12);
    expect(ESCROW_WITNESS_REQUIREMENTS.impureCircuitsWithZkKeys).toEqual([
      ...ESCROW_CIRCUITS,
    ]);
    expect(ESCROW_WITNESS_REQUIREMENTS.pureCircuitsNoZkKeys.circuits).toContain(
      'roleCommitment',
    );
    expect(
      ESCROW_WITNESS_REQUIREMENTS.localProveInitialize.doesNotNeed.join(' '),
    ).toMatch(/funded/i);
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
  });
});

describe('makeEscrowLabSecrets', () => {
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
  });
});

describe('prove-escrow-local live (optional)', () => {
  it('proves initialize against local proof-server when healthy', async () => {
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
    const report = await proveEscrowLocal({ timeout: 180_000 });
    expect(report.ok).toBe(true);
    expect(report.circuit).toBe('initialize');
    expect(report.preimageBytes).toBeGreaterThan(0);
    expect(report.proofBytes).toBeGreaterThan(100);
    expect(report.ledger.clientPkPrefix).toMatch(/^[0-9a-f]{16}$/);
    expect(report.witness.fundedWallet).toBe(false);
    expect(report.claim).toMatch(/NOT a Preprod deploy/);
  }, 200_000);
});
