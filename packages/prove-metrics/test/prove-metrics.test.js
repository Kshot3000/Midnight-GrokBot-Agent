import { describe, expect, it } from 'vitest';
import {
  parseLastProve,
  normalizeProveReport,
  detectProveKind,
  formatBytes,
  formatMs,
  summarizeProveStatus,
  fetchLastProve,
  probeProveBridge,
  requestBridgeProve,
  requestBridgeProveHello,
  proveStepRows,
  bridgeLastProveUrl,
  ESCROW_BRIDGE_PATHS,
  PROVE_CLAIM,
  DEFAULT_BRIDGE_URL,
} from '../src/index.mjs';

const helloSample = {
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

const escrowSample = {
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

const escrowAllSample = {
  kind: 'escrow-local-prove-all',
  ok: true,
  claim: PROVE_CLAIM,
  paths: [
    { path: 'initialize', stepCount: 1, circuitsProved: ['initialize'], totalProveMs: 800 },
    { path: 'happy', stepCount: 4, circuitsProved: ['initialize', 'fund'], totalProveMs: 2000 },
  ],
  circuitsCovered: ['initialize', 'fund'],
  coveredCount: 2,
  expectedImpure: 12,
  allImpureCovered: false,
  witness: { fundedWallet: false },
};

describe('@kshot/prove-metrics detect + parse', () => {
  it('detectProveKind', () => {
    expect(detectProveKind(helloSample)).toBe('hello');
    expect(detectProveKind(escrowSample)).toBe('escrow');
    expect(detectProveKind(escrowAllSample)).toBe('escrow-all');
    expect(detectProveKind({ foo: 1 })).toBe('unknown');
  });

  it('parseLastProve accepts hello slim + raw CLI dump', () => {
    const r = parseLastProve(JSON.stringify(helloSample));
    expect(r.ok).toBe(true);
    expect(r.report.kind).toBe('hello-local-prove');
    expect(r.report.totals.proofBytes).toBe(2940);
    expect(r.report.greetings.after).toBe('1');

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
    const r2 = parseLastProve(raw);
    expect(r2.ok).toBe(true);
    expect(r2.report.steps).toHaveLength(1);
  });

  it('parseLastProve accepts escrow slim + all-paths', () => {
    const r = parseLastProve(JSON.stringify(escrowSample));
    expect(r.ok).toBe(true);
    expect(r.report.path).toBe('happy');
    expect(r.report.steps).toHaveLength(2);

    const all = parseLastProve(escrowAllSample);
    expect(all.ok).toBe(true);
    expect(all.report.kind).toBe('escrow-local-prove-all');
    expect(all.report.coveredCount).toBe(2);
  });

  it('parseLastProve rejects junk', () => {
    expect(parseLastProve('nope').ok).toBe(false);
    expect(parseLastProve({ foo: 1 }).ok).toBe(false);
    expect(parseLastProve({ ok: false, kind: 'escrow-local-prove', steps: [] }).ok).toBe(false);
  });
});

describe('@kshot/prove-metrics format + summarize', () => {
  it('formatBytes / formatMs', () => {
    expect(formatBytes(4508)).toBe('4508 B');
    expect(formatBytes(2940)).toBe('2940 B');
    expect(formatBytes(20 * 1024)).toMatch(/KiB/);
    expect(formatMs(848)).toBe('848 ms');
    expect(formatMs(2500)).toBe('2.50 s');
    expect(formatBytes(null)).toBe('—');
  });

  it('summarize hello / escrow / empty', () => {
    const h = summarizeProveStatus(normalizeProveReport(helloSample), { studio: 'hello' });
    expect(h.state).toBe('loaded');
    expect(h.label).toMatch(/increment/);

    const e = summarizeProveStatus(normalizeProveReport(escrowSample));
    expect(e.state).toBe('loaded');
    expect(e.label).toContain('happy');

    const a = summarizeProveStatus(normalizeProveReport(escrowAllSample));
    expect(a.label).toMatch(/All-paths/);

    const emptyH = summarizeProveStatus(null, { studio: 'hello' });
    expect(emptyH.detail).toMatch(/prove:hello-local/);
    expect(emptyH.honest).toMatch(/NOT on-chain/);

    const emptyE = summarizeProveStatus(null, { studio: 'escrow' });
    expect(emptyE.detail).toMatch(/prove:escrow-local/);
  });

  it('proveStepRows', () => {
    expect(proveStepRows(normalizeProveReport(helloSample))[0].proof).toBe('2940 B');
    expect(proveStepRows(normalizeProveReport(escrowSample))[0].circuit).toBe('initialize');
  });
});

describe('@kshot/prove-metrics fetch + bridge', () => {
  it('bridgeLastProveUrl + ESCROW_BRIDGE_PATHS', () => {
    expect(bridgeLastProveUrl()).toBe('http://127.0.0.1:6399/last-prove');
    expect(bridgeLastProveUrl(DEFAULT_BRIDGE_URL, 'hello')).toContain('contract=hello');
    expect(ESCROW_BRIDGE_PATHS).toContain('happy');
    expect(ESCROW_BRIDGE_PATHS).toContain('all');
  });

  it('fetchLastProve happy + 404 softFail', async () => {
    const okFetch = async () => ({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(escrowSample),
    });
    const r = await fetchLastProve('./last-prove.json', { fetchImpl: okFetch });
    expect(r.ok).toBe(true);
    expect(r.report.stepCount).toBe(2);

    const miss = async () => ({ ok: false, status: 404, text: async () => '' });
    const r404 = await fetchLastProve('./last-prove.json', {
      fetchImpl: miss,
      emptyHint: 'No last-prove.json yet — run prove:escrow-local first',
    });
    expect(r404.ok).toBe(false);
    expect(r404.softFail).toBe(true);
    expect(r404.error).toMatch(/prove:escrow-local/);
  });

  it('probeProveBridge', async () => {
    const fetchImpl = async () => ({
      ok: true,
      json: async () => ({ ok: true, lastProveExists: true, helloLastProveExists: true }),
    });
    const r = await probeProveBridge('http://127.0.0.1:6399', { fetchImpl });
    expect(r.ok).toBe(true);
    expect(r.body.helloLastProveExists).toBe(true);
  });

  it('requestBridgeProve escrow path + hello alias + bad path softFail', async () => {
    const escrowFetch = async () => ({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ ok: true, report: escrowSample }),
    });
    const r = await requestBridgeProve(DEFAULT_BRIDGE_URL, {
      path: 'happy',
      fetchImpl: escrowFetch,
    });
    expect(r.ok).toBe(true);
    expect(r.report.path).toBe('happy');

    const helloFetch = async () => ({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ ok: true, report: helloSample }),
    });
    const h = await requestBridgeProveHello(DEFAULT_BRIDGE_URL, { fetchImpl: helloFetch });
    expect(h.ok).toBe(true);
    expect(h.report.kind).toBe('hello-local-prove');

    const bad = await requestBridgeProve(DEFAULT_BRIDGE_URL, {
      path: 'not-a-path',
      fetchImpl: async () => ({ ok: true, status: 200, text: async () => '{}' }),
    });
    expect(bad.ok).toBe(false);
    expect(bad.softFail).toBe(true);
    expect(bad.error).toMatch(/Unknown escrow path/);
  });

  it('requestBridgeProve soft-fails 503', async () => {
    const fetchImpl = async () => ({
      ok: false,
      status: 503,
      text: async () =>
        JSON.stringify({ ok: false, softFail: true, error: 'proof-server down' }),
    });
    const r = await requestBridgeProve(DEFAULT_BRIDGE_URL, {
      path: 'initialize',
      fetchImpl,
    });
    expect(r.ok).toBe(false);
    expect(r.softFail).toBe(true);
    expect(r.error).toMatch(/proof-server/);
  });
});
