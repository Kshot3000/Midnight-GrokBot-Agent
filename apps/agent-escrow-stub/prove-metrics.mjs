/**
 * Helpers for Agent Escrow Studio local-prove metrics panel.
 * Parses last-prove.json (from CLI or prove-bridge). LOCAL ≠ on-chain.
 */

export const LAST_PROVE_SCHEMA = 1;
export const DEFAULT_BRIDGE_URL = 'http://127.0.0.1:6399';
export const DEFAULT_STATIC_URL = './last-prove.json';

export const PROVE_CLAIM =
  'local ZK prove against proof-server — NOT a Preprod deploy / NOT on-chain';

/**
 * @param {unknown} raw
 * @returns {{ ok: true, report: object } | { ok: false, error: string }}
 */
export function parseLastProve(raw) {
  let data = raw;
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw);
    } catch {
      return { ok: false, error: 'Invalid JSON' };
    }
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false, error: 'Expected a prove report object' };
  }
  const kind = data.kind;
  if (kind !== 'escrow-local-prove' && kind !== 'escrow-local-prove-all') {
    // Accept full CLI dump if it has steps + claim
    if (!Array.isArray(data.steps) && !Array.isArray(data.paths)) {
      return { ok: false, error: 'Not an escrow local-prove report (missing steps/paths)' };
    }
  }
  if (data.ok === false) {
    return { ok: false, error: 'Report marked ok=false' };
  }

  const report = normalizeProveReport(data);
  return { ok: true, report };
}

/**
 * Normalize CLI full dump or slim last-prove into a stable UI shape.
 * @param {object} data
 */
export function normalizeProveReport(data) {
  const isAll = Array.isArray(data.paths) && !Array.isArray(data.steps);
  if (isAll) {
    return {
      schemaVersion: data.schemaVersion ?? LAST_PROVE_SCHEMA,
      kind: 'escrow-local-prove-all',
      claim: data.claim || PROVE_CLAIM,
      writtenAt: data.writtenAt || null,
      source: data.source || 'prove:escrow-all',
      ok: data.ok !== false,
      path: 'all',
      paths: data.paths.map((p) => ({
        path: p.path,
        stepCount: p.stepCount,
        circuitsProved: p.circuitsProved || [],
        totalProveMs: p.totalProveMs ?? null,
      })),
      circuitsCovered: data.circuitsCovered || [],
      coveredCount: data.coveredCount ?? (data.circuitsCovered || []).length,
      expectedImpure: data.expectedImpure ?? 12,
      allImpureCovered: Boolean(data.allImpureCovered),
      steps: [],
      totals: {
        proveMs: (data.paths || []).reduce((a, p) => a + (Number(p.totalProveMs) || 0), 0),
        checkMs: null,
        proofBytes: null,
        preimageBytes: null,
      },
      ledger: null,
      witness: { fundedWallet: false, ...(data.witness || {}) },
      proofServer: data.proofServer || null,
      studioHint: data.studioHint || null,
    };
  }

  const steps = (data.steps || []).map((s) => ({
    circuit: s.circuit,
    role: s.role || null,
    ok: s.ok !== false,
    preimageBytes: numOrNull(s.preimageBytes),
    checkMs: numOrNull(s.checkMs),
    proofBytes: numOrNull(s.proofBytes),
    proveMs: numOrNull(s.proveMs),
    ledgerState: s.ledgerState ?? null,
  }));

  const totals = data.totals || {
    proveMs: steps.reduce((a, s) => a + (s.proveMs || 0), 0),
    checkMs: steps.reduce((a, s) => a + (s.checkMs || 0), 0),
    proofBytes: steps.reduce((a, s) => a + (s.proofBytes || 0), 0),
    preimageBytes: steps.reduce((a, s) => a + (s.preimageBytes || 0), 0),
  };

  return {
    schemaVersion: data.schemaVersion ?? LAST_PROVE_SCHEMA,
    kind: data.kind || 'escrow-local-prove',
    claim: data.claim || PROVE_CLAIM,
    writtenAt: data.writtenAt || null,
    source: data.source || 'prove:escrow-local',
    ok: data.ok !== false,
    path: data.path || null,
    circuitsProved: data.circuitsProved || steps.map((s) => s.circuit),
    stepCount: data.stepCount ?? steps.length,
    steps,
    totals: {
      proveMs: numOrNull(totals.proveMs),
      checkMs: numOrNull(totals.checkMs),
      proofBytes: numOrNull(totals.proofBytes),
      preimageBytes: numOrNull(totals.preimageBytes),
    },
    ledger: data.ledger || null,
    witness: {
      fundedWallet: false,
      kind: data.witness?.kind || null,
      note: data.witness?.note || null,
    },
    proofServer: data.proofServer || null,
    studioHint: data.studioHint || null,
  };
}

function numOrNull(v) {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * Format bytes for display (e.g. 4508 → "4508 B").
 * @param {number|null|undefined} n
 */
export function formatBytes(n) {
  if (n == null || !Number.isFinite(n)) return '—';
  // Exact bytes for ZK proof sizes (e.g. 4508 B) — more honest than rounding.
  // Compact form only for large aggregates (≥ 16 KiB).
  if (n < 16 * 1024) return `${Math.round(n)} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KiB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MiB`;
}

/**
 * @param {number|null|undefined} ms
 */
export function formatMs(ms) {
  if (ms == null || !Number.isFinite(ms)) return '—';
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

/**
 * Build a short status summary for the Studio panel.
 * @param {object|null} report
 * @param {{ sourceLabel?: string }} [meta]
 */
export function summarizeProveStatus(report, meta = {}) {
  if (!report) {
    return {
      state: 'empty',
      label: 'No local prove loaded',
      detail:
        'Run npm run prove:escrow-local (writes last-prove.json) or start prove-bridge on :6399.',
      honest: PROVE_CLAIM,
    };
  }
  if (report.kind === 'escrow-local-prove-all') {
    return {
      state: 'loaded',
      label: `All-paths · ${report.coveredCount}/${report.expectedImpure} impure`,
      detail: `${(report.paths || []).length} paths · total prove ${formatMs(report.totals?.proveMs)} · ${meta.sourceLabel || report.source || 'file'}`,
      honest: report.claim || PROVE_CLAIM,
    };
  }
  return {
    state: 'loaded',
    label: `path=${report.path || '?'} · ${report.stepCount} steps`,
    detail: `proof Σ ${formatBytes(report.totals?.proofBytes)} · prove ${formatMs(report.totals?.proveMs)} · ${meta.sourceLabel || report.source || 'file'}`,
    honest: report.claim || PROVE_CLAIM,
  };
}

/**
 * Fetch last-prove from a URL (static file or bridge).
 * @param {string} url
 * @param {{ fetchImpl?: typeof fetch, signal?: AbortSignal }} [opts]
 */
export async function fetchLastProve(url, opts = {}) {
  const fetchImpl = opts.fetchImpl || globalThis.fetch;
  if (!fetchImpl) return { ok: false, error: 'fetch unavailable' };
  try {
    const res = await fetchImpl(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: opts.signal,
    });
    if (res.status === 404) {
      return { ok: false, error: 'No last-prove.json yet — run prove:escrow-local first' };
    }
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` };
    }
    const text = await res.text();
    return parseLastProve(text);
  } catch (e) {
    return { ok: false, error: String(e?.message || e) };
  }
}

/**
 * Probe prove-bridge health.
 * @param {string} [baseUrl]
 * @param {{ fetchImpl?: typeof fetch, signal?: AbortSignal }} [opts]
 */
export async function probeProveBridge(baseUrl = DEFAULT_BRIDGE_URL, opts = {}) {
  const fetchImpl = opts.fetchImpl || globalThis.fetch;
  if (!fetchImpl) return { ok: false, error: 'fetch unavailable' };
  const url = `${baseUrl.replace(/\/$/, '')}/health`;
  try {
    const res = await fetchImpl(url, { signal: opts.signal });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, url };
    const body = await res.json();
    return { ok: Boolean(body?.ok), body, url };
  } catch (e) {
    return { ok: false, error: String(e?.message || e), url };
  }
}

/**
 * Request a live prove via bridge (POST /prove?path=…).
 * @param {string} [baseUrl]
 * @param {{ path?: string, fetchImpl?: typeof fetch, signal?: AbortSignal }} [opts]
 */
export async function requestBridgeProve(baseUrl = DEFAULT_BRIDGE_URL, opts = {}) {
  const fetchImpl = opts.fetchImpl || globalThis.fetch;
  if (!fetchImpl) return { ok: false, error: 'fetch unavailable' };
  const pathName = opts.path || 'initialize';
  const url = `${baseUrl.replace(/\/$/, '')}/prove?path=${encodeURIComponent(pathName)}`;
  try {
    const res = await fetchImpl(url, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      signal: opts.signal,
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return { ok: false, error: `Bridge returned non-JSON (HTTP ${res.status})` };
    }
    if (!res.ok || data.ok === false) {
      return { ok: false, error: data.error || data.message || `HTTP ${res.status}`, data };
    }
    return parseLastProve(data.report || data);
  } catch (e) {
    return { ok: false, error: String(e?.message || e) };
  }
}

/**
 * Rows for the metrics table.
 * @param {object} report
 * @returns {Array<{ circuit: string, role: string, preimage: string, proof: string, ms: string, state: string }>}
 */
export function proveStepRows(report) {
  if (!report?.steps?.length) return [];
  return report.steps.map((s) => ({
    circuit: s.circuit,
    role: s.role || '—',
    preimage: formatBytes(s.preimageBytes),
    proof: formatBytes(s.proofBytes),
    ms: formatMs(s.proveMs),
    state: s.ledgerState == null ? '—' : String(s.ledgerState),
  }));
}
