/**
 * Compact Atelier — pure helpers (testable).
 * Lesson progress persistence. Not a Compact compiler. Not on-chain.
 */

export const DOMAIN = 'compact-atelier:v1';
export const STORAGE_KEY = 'mn-compact-atelier-v1';
export const SCHEMA_VERSION = 2;
export const DONATE_ADDR =
  'addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v';
export const EXPORT_KIND = 'midnight-lab.compact-atelier';
export const LESSON_IDS = ['hello-counter', 'witness-secret', 'mps-0029', 'disclose-pattern', 'map-ledger', 'commit-nullifier'];
export const PHASES = ['idle', 'loaded', 'edited', 'explained', 'linted'];

export function short(h, n = 10) {
  if (!h) return '—';
  return h.length <= n * 2 ? h : h.slice(0, n) + '…' + h.slice(-4);
}

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function emptyStudioState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    lessonId: null,
    source: '',
    baselineSource: '',
    explained: false,
    linted: false,
    phase: 'idle',
    updatedAt: null,
  };
}

export function normalizeStudioState(raw) {
  const base = emptyStudioState();
  if (!raw || typeof raw !== 'object') return base;
  let lessonId = raw.lessonId != null ? String(raw.lessonId) : null;
  if (lessonId && LESSON_IDS.length && !LESSON_IDS.includes(lessonId)) {
    // keep unknown ids for forward-compat, still allow
    lessonId = lessonId || null;
  }
  let phase = typeof raw.phase === 'string' && PHASES.includes(raw.phase) ? raw.phase : 'idle';
  const explained = Boolean(raw.explained);
  const linted = Boolean(raw.linted);
  if (!lessonId) phase = 'idle';
  else if (linted) phase = 'linted';
  else if (explained) phase = 'explained';
  else if (raw.source && raw.baselineSource && raw.source !== raw.baselineSource) phase = 'edited';
  else if (phase === 'idle') phase = 'loaded';
  return {
    schemaVersion: SCHEMA_VERSION,
    lessonId,
    source: typeof raw.source === 'string' ? raw.source.slice(0, 200000) : '',
    baselineSource: typeof raw.baselineSource === 'string' ? raw.baselineSource.slice(0, 200000) : '',
    explained,
    linted,
    phase,
    updatedAt: raw.updatedAt || null,
  };
}

export function buildExportDocument(state, meta = {}) {
  const normalized = normalizeStudioState(state);
  return {
    kind: EXPORT_KIND,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    lab: 'Midnight GrokBot Agent · Compact Atelier',
    note: 'LOCAL educational snapshot — not a Compact compiler / not on-chain. Contains lesson draft source.',
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
      : data.lessonId != null || data.source != null
        ? data
        : null;
  if (!candidate) {
    return {
      ok: false,
      state: null,
      error: `Expected kind ${EXPORT_KIND} or a raw { lessonId, source } snapshot`,
    };
  }
  const state = normalizeStudioState(candidate);
  if (!state.lessonId && !state.source) {
    return { ok: false, state: null, error: 'Import has no lesson progress' };
  }
  return { ok: true, state, error: null };
}
