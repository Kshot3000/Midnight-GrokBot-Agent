/**
 * Proof Playground — pure helpers (testable).
 * Teaching stand-ins for ZK / circuit prove-verify theater. Not a proof server. Not Compact. Not on-chain.
 */

export const DOMAIN = 'proof-playground:v1';
export const STORAGE_KEY = 'mn-proof-playground-v1';
export const SCHEMA_VERSION = 2;
export const DONATE_ADDR =
  'addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v';
export const EXPORT_KIND = 'midnight-lab.proof-playground';
export const CIRCUIT_IDS = ['commit', 'range', 'equality', 'disclose', 'sum'];

export function short(hex, n = 10) {
  if (!hex) return '—';
  return hex.length <= n * 2 ? hex : `${hex.slice(0, n)}…${hex.slice(-6)}`;
}

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function historyStats(history) {
  const list = history || [];
  return {
    runs: list.length,
    ok: list.filter((h) => h.verified === true).length,
    fail: list.filter((h) => h.verified === false).length,
  };
}

function normalizeHistoryEntry(h) {
  if (!h || typeof h !== 'object') return null;
  const out = {
    id: String(h.id || ''),
    circuitId: String(h.circuitId || ''),
    name: String(h.name || ''),
    blob: String(h.blob || ''),
    verified: h.verified === true ? true : h.verified === false ? false : null,
    at: String(h.at || ''),
    note: String(h.note || ''),
  };
  return out.id ? out : null;
}

function normalizePreset(p) {
  if (!p || typeof p !== 'object') return null;
  const circuitId = String(p.circuitId || '');
  if (!circuitId) return null;
  return {
    circuitId,
    witnesses: p.witnesses && typeof p.witnesses === 'object' ? { ...p.witnesses } : {},
    label: String(p.label || circuitId),
  };
}

export function emptyStudioState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    history: [],
    activeId: 'commit',
    presets: {},
    updatedAt: null,
  };
}

export function normalizeStudioState(raw) {
  const base = emptyStudioState();
  if (!raw || typeof raw !== 'object') return base;
  const history = Array.isArray(raw.history)
    ? raw.history.map(normalizeHistoryEntry).filter(Boolean).slice(0, 80)
    : [];
  let activeId = raw.activeId != null ? String(raw.activeId) : 'range';
  if (!CIRCUIT_IDS.includes(activeId)) activeId = 'commit';
  const presets = {};
  if (raw.presets && typeof raw.presets === 'object' && !Array.isArray(raw.presets)) {
    for (const [k, v] of Object.entries(raw.presets)) {
      const n = normalizePreset(v);
      if (n) presets[String(k)] = n;
    }
  }
  return {
    schemaVersion: SCHEMA_VERSION,
    history,
    activeId,
    presets,
    updatedAt: raw.updatedAt || null,
  };
}

export function buildExportDocument(state, meta = {}) {
  const normalized = normalizeStudioState(state);
  return {
    kind: EXPORT_KIND,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    lab: 'Midnight GrokBot Agent · Proof Playground',
    note: 'LOCAL educational snapshot — not a proof server / not on-chain. History blobs are simulated.',
    donate: DONATE_ADDR,
    handle: '@kshot9000',
    ...meta,
    state: normalized,
  };
}

export function parseImportDocument(input) {
  let data = input;
  if (typeof input === 'string') {
    try {
      data = JSON.parse(input);
    } catch {
      return { ok: false, state: null, error: 'Invalid JSON' };
    }
  }
  if (!data || typeof data !== 'object') {
    return { ok: false, state: null, error: 'Import must be an object' };
  }
  const candidate =
    data.kind === EXPORT_KIND && data.state
      ? data.state
      : Array.isArray(data.history) || data.activeId
        ? data
        : null;
  if (!candidate) {
    return {
      ok: false,
      state: null,
      error: `Expected kind ${EXPORT_KIND} or a raw { history, activeId } snapshot`,
    };
  }
  const state = normalizeStudioState(candidate);
  if (!state.history.length && !Object.keys(state.presets).length && state.activeId === 'commit') {
    // allow activeId-only imports as ok if history empty but explicit
    if (!Array.isArray(candidate.history) && !candidate.activeId) {
      return { ok: false, state: null, error: 'Import has no history or presets' };
    }
  }
  return { ok: true, state, error: null };
}
