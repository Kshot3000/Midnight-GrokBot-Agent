/**
 * Helpers for Hello Studio local-prove metrics panel.
 * Parses last-prove.json (from prove:hello-local or prove-bridge). LOCAL ≠ on-chain.
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
  const looksHello =
    kind === 'hello-local-prove' ||
    data.circuit === 'increment' ||
    (data.greetings && (data.proofBytes != null || Array.isArray(data.steps)));

  if (!looksHello && kind !== 'escrow-local-prove' && kind !== 'escrow-local-prove-all') {
    if (!Array.isArray(data.steps) && data.proofBytes == null) {
      return { ok: false, error: 'Not a hello/escrow local-prove report' };
    }
  }

  if (data.ok === false) {
    return { ok: false, error: 'Report marked ok=false' };
  }

  return { ok: true, report: normalizeProveReport(data) };
}

/**
 * @param {object} data
 */
export function normalizeProveReport(data) {
  if (data.kind === 'hello-local-prove' || (data.circuit === 'increment' && data.greetings && !Array.isArray(data.paths))) {
    const steps = Array.isArray(data.steps) && data.steps.length
      ? data.steps.map((s) => ({
          circuit: s.circuit || 'increment',
          role: s.role || 'caller',
          ok: s.ok !== false,
          preimageBytes: numOrNull(s.preimageBytes),
          checkMs: numOrNull(s.checkMs),
          proofBytes: numOrNull(s.proofBytes),
          proveMs: numOrNull(s.proveMs),
          ledgerState: s.ledgerState ?? data.greetings?.after ?? null,
        }))
      : [
          {
            circuit: data.circuit || 'increment',
            role: 'caller',
            ok: data.ok !== false,
            preimageBytes: numOrNull(data.preimageBytes),
            checkMs: numOrNull(data.checkMs),
            proofBytes: numOrNull(data.proofBytes),
            proveMs: numOrNull(data.proveMs),
            ledgerState: data.greetings?.after ?? null,
          },
        ];

    const totals = data.totals || {
      proveMs: steps.reduce((a, s) => a + (s.proveMs || 0), 0),
      checkMs: steps.reduce((a, s) => a + (s.checkMs || 0), 0),
      proofBytes: steps.reduce((a, s) => a + (s.proofBytes || 0), 0),
      preimageBytes: steps.reduce((a, s) => a + (s.preimageBytes || 0), 0),
    };

    return {
      schemaVersion: data.schemaVersion ?? LAST_PROVE_SCHEMA,
      kind: 'hello-local-prove',
      claim: data.claim || PROVE_CLAIM,
      writtenAt: data.writtenAt || null,
      source: data.source || 'prove:hello-local',
      ok: data.ok !== false,
      contract: data.contract || 'hello-midnight',
      circuit: data.circuit || 'increment',
      path: data.path || 'increment',
      greetings: data.greetings || null,
      circuitsProved: data.circuitsProved || ['increment'],
      stepCount: data.stepCount ?? steps.length,
      steps,
      totals: {
        proveMs: numOrNull(totals.proveMs),
        checkMs: numOrNull(totals.checkMs),
        proofBytes: numOrNull(totals.proofBytes),
        preimageBytes: numOrNull(totals.preimageBytes),
      },
      checkLen: data.checkLen ?? null,
      zkArtifacts: data.zkArtifacts || null,
      witness: {
        fundedWallet: false,
        kind: data.witness?.kind || 'hello lab (no wallet)',
        note: data.witness?.note || 'NOT Lace / NOT Preprod seed',
      },
      proofServer: data.proofServer || null,
      studioHint: data.studioHint || null,
    };
  }

  // Escrow reports (bridge may return them) — normalize lightly for display.
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
    greetings: null,
    circuitsProved: data.circuitsProved || steps.map((s) => s.circuit),
    stepCount: data.stepCount ?? steps.length,
    steps,
    totals: {
      proveMs: numOrNull(totals.proveMs),
      checkMs: numOrNull(totals.checkMs),
      proofBytes: numOrNull(totals.proofBytes),
      preimageBytes: numOrNull(totals.preimageBytes),
    },
    witness: { fundedWallet: false, ...(data.witness || {}) },
    proofServer: data.proofServer || null,
    studioHint: data.studioHint || null,
  };
}

function numOrNull(v) {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function formatBytes(n) {
  if (n == null || !Number.isFinite(n)) return '—';
  if (n < 16 * 1024) return `${Math.round(n)} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KiB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MiB`;
}

export function formatMs(ms) {
  if (ms == null || !Number.isFinite(ms)) return '—';
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

/**
 * @param {object|null} report
 * @param {{ sourceLabel?: string }} [meta]
 */
export function summarizeProveStatus(report, meta = {}) {
  if (!report) {
    return {
      state: 'empty',
      label: 'No local prove loaded',
      detail:
        'Run npm run prove:hello-local (writes last-prove.json) or start prove-bridge on :6399.',
      honest: PROVE_CLAIM,
    };
  }
  if (report.kind === 'hello-local-prove') {
    const g = report.greetings
      ? `${report.greetings.before}→${report.greetings.after}`
      : '—';
    return {
      state: 'loaded',
      label: `hello · ${report.circuit || 'increment'} · greetings ${g}`,
      detail: `proof ${formatBytes(report.totals?.proofBytes)} · prove ${formatMs(report.totals?.proveMs)} · ${meta.sourceLabel || report.source || 'file'}`,
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
      return { ok: false, error: 'No last-prove.json yet — run prove:hello-local first' };
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
 * @param {string} [baseUrl]
 * @param {{ fetchImpl?: typeof fetch, signal?: AbortSignal }} [opts]
 */
export async function probeProveBridge(baseUrl = DEFAULT_BRIDGE_URL, opts = {}) {
  const fetchImpl = opts.fetchImpl || globalThis.fetch;
  if (!fetchImpl) return { ok: false, error: 'fetch unavailable' };
  const url = `${baseUrl.replace(/\/$/, '')}/health`;
  try {
    const controller = opts.signal ? null : new AbortController();
    const timer = controller ? setTimeout(() => controller.abort(), opts.timeoutMs ?? 4000) : null;
    const res = await fetchImpl(url, { signal: opts.signal || controller?.signal });
    if (timer) clearTimeout(timer);
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, url };
    const body = await res.json();
    return { ok: Boolean(body?.ok), body, url };
  } catch (e) {
    return { ok: false, error: String(e?.message || e), url };
  }
}

/**
 * Request a live hello prove via bridge (POST /prove?contract=hello).
 * @param {string} [baseUrl]
 * @param {{ fetchImpl?: typeof fetch, signal?: AbortSignal, timeoutMs?: number }} [opts]
 */
export async function requestBridgeProveHello(baseUrl = DEFAULT_BRIDGE_URL, opts = {}) {
  const fetchImpl = opts.fetchImpl || globalThis.fetch;
  if (!fetchImpl) return { ok: false, error: 'fetch unavailable' };
  const url = `${baseUrl.replace(/\/$/, '')}/prove?contract=hello`;
  try {
    const controller = opts.signal ? null : new AbortController();
    const timer = controller
      ? setTimeout(() => controller.abort(), opts.timeoutMs ?? 200_000)
      : null;
    const res = await fetchImpl(url, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      signal: opts.signal || controller?.signal,
    });
    if (timer) clearTimeout(timer);
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
    const msg = String(e?.message || e);
    if (/abort/i.test(msg)) {
      return { ok: false, error: 'Bridge prove timed out — soft-fail (proof-server may be slow/down)' };
    }
    return { ok: false, error: msg };
  }
}

/**
 * @param {object} report
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
