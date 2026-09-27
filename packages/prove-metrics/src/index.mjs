/**
 * @kshot/prove-metrics — shared local ZK prove metrics helpers for Hello + Escrow Studios.
 * Parses last-prove.json / prove-bridge responses. LOCAL ≠ on-chain / NOT a Preprod deploy.
 *
 * Canonical source: packages/prove-metrics/src/index.mjs
 * Sync into apps (Pages / python http.server cannot resolve cross-package imports):
 *   npm run sync:prove-metrics
 */

export const LAST_PROVE_SCHEMA = 1;
export const DEFAULT_BRIDGE_URL = 'http://127.0.0.1:6399';
export const DEFAULT_STATIC_URL = './last-prove.json';
export const DEFAULT_PROBE_TIMEOUT_MS = 4000;
export const DEFAULT_PROVE_TIMEOUT_MS = 200_000;

export const PROVE_CLAIM =
  'local ZK prove against proof-server — NOT a Preprod deploy / NOT on-chain';

/** Escrow prove-bridge path query values (POST /prove?path=…). */
export const ESCROW_BRIDGE_PATHS = [
  'initialize',
  'happy',
  'cancel',
  'dispute-release',
  'dispute-refund',
  'all',
];

/**
 * @param {unknown} v
 * @returns {number|null}
 */
function numOrNull(v) {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * Detect report family from raw data.
 * @param {object} data
 * @returns {'hello'|'escrow-all'|'escrow'|'unknown'}
 */
export function detectProveKind(data) {
  if (!data || typeof data !== 'object') return 'unknown';
  const kind = data.kind;
  if (kind === 'hello-local-prove') return 'hello';
  if (kind === 'escrow-local-prove-all') return 'escrow-all';
  if (kind === 'escrow-local-prove') return 'escrow';
  if (Array.isArray(data.paths) && !Array.isArray(data.steps)) return 'escrow-all';
  if (
    data.circuit === 'increment' ||
    (data.greetings && (data.proofBytes != null || Array.isArray(data.steps)))
  ) {
    return 'hello';
  }
  if (Array.isArray(data.steps) || Array.isArray(data.paths)) return 'escrow';
  return 'unknown';
}

/**
 * @param {unknown} raw
 * @param {{ prefer?: 'hello'|'escrow'|'auto' }} [opts]
 * @returns {{ ok: true, report: object } | { ok: false, error: string }}
 */
export function parseLastProve(raw, opts = {}) {
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

  const detected = detectProveKind(data);
  const prefer = opts.prefer || 'auto';

  if (detected === 'unknown') {
    return { ok: false, error: 'Not a hello/escrow local-prove report' };
  }

  if (prefer === 'hello' && detected !== 'hello') {
    // Soft accept escrow if bridge returned the wrong contract — still normalize.
  }
  if (prefer === 'escrow' && detected === 'hello') {
    // Soft accept hello dumps when escrow studio imports by mistake.
  }

  if (data.ok === false) {
    return { ok: false, error: 'Report marked ok=false' };
  }

  return { ok: true, report: normalizeProveReport(data) };
}

/**
 * Normalize CLI full dump or slim last-prove into a stable UI shape.
 * @param {object} data
 */
export function normalizeProveReport(data) {
  const family = detectProveKind(data);

  if (family === 'hello') {
    const steps =
      Array.isArray(data.steps) && data.steps.length
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

  if (family === 'escrow-all') {
    return {
      schemaVersion: data.schemaVersion ?? LAST_PROVE_SCHEMA,
      kind: 'escrow-local-prove-all',
      claim: data.claim || PROVE_CLAIM,
      writtenAt: data.writtenAt || null,
      source: data.source || 'prove:escrow-all',
      ok: data.ok !== false,
      path: 'all',
      greetings: null,
      paths: (data.paths || []).map((p) => ({
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

  // Escrow single-path (or generic steps dump)
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

/**
 * Exact bytes for ZK proof sizes (e.g. 4508 B); compact form only ≥ 16 KiB.
 * @param {number|null|undefined} n
 */
export function formatBytes(n) {
  if (n == null || !Number.isFinite(n)) return '—';
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
 * @param {object|null} report
 * @param {{ sourceLabel?: string, studio?: 'hello'|'escrow' }} [meta]
 */
export function summarizeProveStatus(report, meta = {}) {
  const studio = meta.studio || 'escrow';
  if (!report) {
    const cmd = studio === 'hello' ? 'prove:hello-local' : 'prove:escrow-local';
    return {
      state: 'empty',
      label: 'No local prove loaded',
      detail: `Run npm run ${cmd} (writes last-prove.json) or start prove-bridge on :6399.`,
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
 * @param {string} baseUrl
 * @param {'hello'|'escrow'} [contract]
 */
export function bridgeLastProveUrl(baseUrl = DEFAULT_BRIDGE_URL, contract = 'escrow') {
  const base = baseUrl.replace(/\/$/, '');
  if (contract === 'hello') return `${base}/last-prove?contract=hello`;
  return `${base}/last-prove`;
}

/**
 * @param {string} url
 * @param {{ fetchImpl?: typeof fetch, signal?: AbortSignal, emptyHint?: string }} [opts]
 */
export async function fetchLastProve(url, opts = {}) {
  const fetchImpl = opts.fetchImpl || globalThis.fetch;
  if (!fetchImpl) return { ok: false, error: 'fetch unavailable', softFail: true };
  try {
    const res = await fetchImpl(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: opts.signal,
    });
    if (res.status === 404) {
      return {
        ok: false,
        error: opts.emptyHint || 'No last-prove.json yet — run prove:escrow-local or prove:hello-local first',
        softFail: true,
        status: 404,
      };
    }
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}`, softFail: true, status: res.status };
    }
    const text = await res.text();
    return parseLastProve(text);
  } catch (e) {
    return { ok: false, error: String(e?.message || e), softFail: true };
  }
}

/**
 * Probe prove-bridge health with soft-fail timeout.
 * @param {string} [baseUrl]
 * @param {{ fetchImpl?: typeof fetch, signal?: AbortSignal, timeoutMs?: number }} [opts]
 */
export async function probeProveBridge(baseUrl = DEFAULT_BRIDGE_URL, opts = {}) {
  const fetchImpl = opts.fetchImpl || globalThis.fetch;
  if (!fetchImpl) return { ok: false, error: 'fetch unavailable', softFail: true };
  const url = `${baseUrl.replace(/\/$/, '')}/health`;
  try {
    const controller = opts.signal ? null : new AbortController();
    const timer = controller
      ? setTimeout(() => controller.abort(), opts.timeoutMs ?? DEFAULT_PROBE_TIMEOUT_MS)
      : null;
    const res = await fetchImpl(url, { signal: opts.signal || controller?.signal });
    if (timer) clearTimeout(timer);
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, url, softFail: true, status: res.status };
    const body = await res.json();
    return { ok: Boolean(body?.ok), body, url };
  } catch (e) {
    const msg = String(e?.message || e);
    if (/abort/i.test(msg)) {
      return {
        ok: false,
        error: 'prove-bridge probe timed out — soft-fail (is npm run prove-bridge up?)',
        url,
        softFail: true,
      };
    }
    return { ok: false, error: msg, url, softFail: true };
  }
}

/**
 * Request a live prove via bridge.
 * - Escrow: POST /prove?path=initialize|happy|…|all
 * - Hello:  POST /prove?contract=hello
 *
 * @param {string} [baseUrl]
 * @param {{
 *   contract?: 'hello'|'escrow',
 *   path?: string,
 *   fetchImpl?: typeof fetch,
 *   signal?: AbortSignal,
 *   timeoutMs?: number,
 * }} [opts]
 */
export async function requestBridgeProve(baseUrl = DEFAULT_BRIDGE_URL, opts = {}) {
  const fetchImpl = opts.fetchImpl || globalThis.fetch;
  if (!fetchImpl) return { ok: false, error: 'fetch unavailable', softFail: true };

  const contract = opts.contract || 'escrow';
  let url;
  if (contract === 'hello') {
    url = `${baseUrl.replace(/\/$/, '')}/prove?contract=hello`;
  } else {
    const pathName = opts.path || 'initialize';
    if (!ESCROW_BRIDGE_PATHS.includes(pathName)) {
      return {
        ok: false,
        error: `Unknown escrow path "${pathName}" — expected one of: ${ESCROW_BRIDGE_PATHS.join(', ')}`,
        softFail: true,
      };
    }
    url = `${baseUrl.replace(/\/$/, '')}/prove?path=${encodeURIComponent(pathName)}`;
  }

  try {
    const controller = opts.signal ? null : new AbortController();
    const timer = controller
      ? setTimeout(() => controller.abort(), opts.timeoutMs ?? DEFAULT_PROVE_TIMEOUT_MS)
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
      return {
        ok: false,
        error: `Bridge returned non-JSON (HTTP ${res.status})`,
        softFail: true,
        status: res.status,
      };
    }
    if (!res.ok || data.ok === false) {
      return {
        ok: false,
        error: data.error || data.message || `HTTP ${res.status}`,
        data,
        softFail: Boolean(data.softFail) || res.status === 503 || res.status === 504 || res.status === 404,
        status: res.status,
      };
    }
    return parseLastProve(data.report || data);
  } catch (e) {
    const msg = String(e?.message || e);
    if (/abort/i.test(msg)) {
      return {
        ok: false,
        error: 'Bridge prove timed out — soft-fail (proof-server may be slow/down)',
        softFail: true,
      };
    }
    return { ok: false, error: msg, softFail: true };
  }
}

/**
 * Hello-specific alias → POST /prove?contract=hello
 * @param {string} [baseUrl]
 * @param {{ fetchImpl?: typeof fetch, signal?: AbortSignal, timeoutMs?: number }} [opts]
 */
export async function requestBridgeProveHello(baseUrl = DEFAULT_BRIDGE_URL, opts = {}) {
  return requestBridgeProve(baseUrl, { ...opts, contract: 'hello' });
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
