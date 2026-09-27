import { describe, expect, it } from 'vitest';
import {
  parseLastProve,
  normalizeProveReport,
  formatBytes,
  formatMs,
  summarizeProveStatus,
  fetchLastProve,
  probeProveBridge,
  proveStepRows,
  PROVE_CLAIM,
} from '../prove-metrics.mjs';

const sample = {
  schemaVersion: 1,
  kind: 'escrow-local-prove',
  claim: PROVE_CLAIM,
  writtenAt: '2026-09-26T05:00:00.000Z',
  source: 'prove:escrow-local path=happy',
  ok: true,
  path: 'happy',
  circuitsProved: ['initialize', 'fund'],
  stepCount: 2,
  steps: [
    {
      circuit: 'initialize',
      role: 'client',
      preimageBytes: 794,
      checkMs: 11,
      proofBytes: 4508,
      proveMs: 848,
      ledgerState: 0,
    },
    {
      circuit: 'fund',
      role: 'client',
      preimageBytes: 800,
      checkMs: 10,
      proofBytes: 4508,
      proveMs: 900,
      ledgerState: 1,
    },
  ],
  totals: { proveMs: 1748, checkMs: 21, proofBytes: 9016, preimageBytes: 1594 },
  witness: { fundedWallet: false },
};

describe('prove-metrics', () => {
  it('parseLastProve accepts slim report', () => {
    const r = parseLastProve(JSON.stringify(sample));
    expect(r.ok).toBe(true);
    expect(r.report.path).toBe('happy');
    expect(r.report.steps).toHaveLength(2);
    expect(r.report.totals.proveMs).toBe(1748);
  });

  it('parseLastProve rejects junk', () => {
    expect(parseLastProve('not-json').ok).toBe(false);
    expect(parseLastProve({ foo: 1 }).ok).toBe(false);
  });

  it('normalizeProveReport accepts full CLI dump with steps', () => {
    const full = {
      claim: 'local ZK',
      ok: true,
      path: 'initialize',
      steps: [{ circuit: 'initialize', role: 'client', preimageBytes: 10, proofBytes: 20, proveMs: 5, checkMs: 1 }],
      witness: { fundedWallet: false },
    };
    const n = normalizeProveReport(full);
    expect(n.stepCount).toBe(1);
    expect(n.totals.proofBytes).toBe(20);
  });

  it('formatBytes / formatMs', () => {
    expect(formatBytes(4508)).toBe('4508 B');
    expect(formatBytes(2048)).toBe('2048 B');
    expect(formatBytes(20 * 1024)).toMatch(/KiB/);
    expect(formatMs(848)).toBe('848 ms');
    expect(formatMs(2500)).toBe('2.50 s');
    expect(formatBytes(null)).toBe('—');
  });

  it('summarizeProveStatus empty + loaded', () => {
    expect(summarizeProveStatus(null).state).toBe('empty');
    const s = summarizeProveStatus(normalizeProveReport(sample));
    expect(s.state).toBe('loaded');
    expect(s.label).toContain('happy');
    expect(s.honest).toContain('NOT');
  });

  it('proveStepRows', () => {
    const rows = proveStepRows(normalizeProveReport(sample));
    expect(rows[0].circuit).toBe('initialize');
    expect(rows[0].proof).toBe('4508 B');
  });

  it('fetchLastProve happy path via mock fetch', async () => {
    const fetchImpl = async () => ({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(sample),
    });
    const r = await fetchLastProve('./last-prove.json', { fetchImpl });
    expect(r.ok).toBe(true);
    expect(r.report.stepCount).toBe(2);
  });

  it('fetchLastProve 404', async () => {
    const fetchImpl = async () => ({ ok: false, status: 404, text: async () => '' });
    const r = await fetchLastProve('./last-prove.json', { fetchImpl });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/prove:escrow-local/);
  });

  it('probeProveBridge', async () => {
    const fetchImpl = async () => ({
      ok: true,
      json: async () => ({ ok: true, lastProveExists: true }),
    });
    const r = await probeProveBridge('http://127.0.0.1:6399', { fetchImpl });
    expect(r.ok).toBe(true);
  });
});
