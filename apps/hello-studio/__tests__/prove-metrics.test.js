import { describe, expect, it } from 'vitest';
import {
  parseLastProve,
  normalizeProveReport,
  formatBytes,
  formatMs,
  summarizeProveStatus,
  proveStepRows,
  PROVE_CLAIM,
  detectProveKind,
  ESCROW_BRIDGE_PATHS,
  HELLO_BRIDGE_CIRCUITS,
  requestBridgeProveHello,
} from '../prove-metrics.mjs';

const sample = {
  schemaVersion: 1,
  kind: 'hello-local-prove',
  claim: PROVE_CLAIM,
  writtenAt: '2026-09-27T21:00:00.000Z',
  source: 'prove:hello-local',
  ok: true,
  circuit: 'increment',
  path: 'increment',
  greetings: { before: '0', after: '1' },
  stepCount: 1,
  steps: [
    {
      circuit: 'increment',
      role: 'caller',
      preimageBytes: 400,
      checkMs: 12,
      proofBytes: 2940,
      proveMs: 720,
      ledgerState: '1',
    },
  ],
  totals: { proveMs: 720, checkMs: 12, proofBytes: 2940, preimageBytes: 400 },
  witness: { fundedWallet: false },
};

describe('hello prove-metrics', () => {
  it('parseLastProve accepts hello slim report', () => {
    const r = parseLastProve(JSON.stringify(sample));
    expect(r.ok).toBe(true);
    expect(r.report.kind).toBe('hello-local-prove');
    expect(r.report.totals.proofBytes).toBe(2940);
    expect(r.report.greetings.after).toBe('1');
  });

  it('parseLastProve accepts raw CLI dump', () => {
    const raw = {
      ok: true,
      circuit: 'increment',
      greetings: { before: '0', after: '1' },
      preimageBytes: 100,
      proofBytes: 2940,
      proveMs: 500,
      checkMs: 10,
      claim: 'local ZK prove against proof-server — NOT a Preprod deploy',
    };
    const r = parseLastProve(raw);
    expect(r.ok).toBe(true);
    expect(r.report.steps).toHaveLength(1);
    expect(r.report.totals.proofBytes).toBe(2940);
  });

  it('parseLastProve rejects junk', () => {
    expect(parseLastProve('nope').ok).toBe(false);
    expect(parseLastProve({ foo: 1 }).ok).toBe(false);
  });

  it('summarize + rows', () => {
    const n = normalizeProveReport(sample);
    const s = summarizeProveStatus(n);
    expect(s.state).toBe('loaded');
    expect(s.label).toMatch(/increment/);
    expect(proveStepRows(n)[0].proof).toBe('2940 B');
    expect(formatBytes(2940)).toBe('2940 B');
    expect(formatMs(720)).toBe('720 ms');
  });

  it('shared package detects escrow kinds too', () => {
    expect(detectProveKind({ kind: 'escrow-local-prove', steps: [] })).toBe('escrow');
    expect(ESCROW_BRIDGE_PATHS).toContain('all');
  });

  it('empty status is honest', () => {
    const s = summarizeProveStatus(null, { studio: 'hello' });
    expect(s.state).toBe('empty');
    expect(s.detail).toMatch(/prove:hello-local/);
    expect(s.honest).toMatch(/NOT on-chain/);
  });
});

describe('hello recordNote metrics', () => {
  const noteReport = {
    ok: true,
    circuit: 'recordNote',
    greetings: { before: '0', after: '0' },
    noteCount: { before: '0', after: '1' },
    preimageBytes: 480,
    proofBytes: 3100,
    proveMs: 800,
    checkMs: 14,
    witness: { kind: 'localNote Bytes<32>', noteOnLedger: false, emptyRejected: true, fundedWallet: false },
    claim: 'local ZK prove against proof-server — NOT a Preprod deploy',
  };

  it('detects recordNote even without relying on increment', () => {
    expect(detectProveKind({ circuit: 'recordNote', noteCount: { before: '0', after: '1' }, proofBytes: 1 })).toBe('hello');
    expect(HELLO_BRIDGE_CIRCUITS).toEqual(['increment', 'recordNote']);
  });

  it('keeps noteCount and witness flags', () => {
    const r = parseLastProve(noteReport);
    expect(r.ok).toBe(true);
    expect(r.report.circuit).toBe('recordNote');
    expect(r.report.noteCount).toEqual({ before: '0', after: '1' });
    expect(r.report.circuitsProved).toEqual(['recordNote']);
    expect(r.report.witness.noteOnLedger).toBe(false);
    expect(r.report.witness.emptyRejected).toBe(true);
    expect(summarizeProveStatus(r.report).label).toMatch(/recordNote/);
    expect(summarizeProveStatus(r.report).label).toMatch(/notes 0→1/);
  });

  it('requestBridgeProveHello rejects an unknown circuit before fetch', async () => {
    const r = await requestBridgeProveHello('http://127.0.0.1:6399', {
      circuit: 'settle',
      fetchImpl: async () => {
        throw new Error('fetch should not run');
      },
    });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/recordNote/);
  });
});

