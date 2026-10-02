/**
 * Auth Forge — pure helpers (testable).
 * Teaching stand-ins for MPS-0029 forgeable ownPublicKey vs witness-derived auth.
 * Not Compact. Not on-chain.
 */

export const DOMAIN = 'auth-lab:v1';
export const DOMAIN_PK = 'auth-lab:pk:v1';
export const DOMAIN_BOARD = 'bboard:poster:v1';
export const STORAGE_KEY = 'mn-auth-lab-v1';
/** Legacy keys from pre-LOCAL-TRUE stub (migrated once). */
export const LEGACY_SK_KEY = 'mn-auth-lab-sk-v1';
export const LEGACY_POSTS_KEY = 'mn-auth-lab-posts-v1';
export const LEGACY_SCORE_KEY = 'mn-auth-lab-score-v1';
export const SCHEMA_VERSION = 2;
export const DONATE_ADDR =
  'addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v';
export const EXPORT_KIND = 'midnight-lab.auth-forge';
export const JOURNEY_PHASES = ['idle', 'deployed', 'forged', 'safe'];

export function short(hex, n = 10) {
  if (!hex) return '—';
  const h = String(hex);
  return h.length <= n * 2 ? h : `${h.slice(0, n)}…${h.slice(-6)}`;
}

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function isHex64(s) {
  return /^[0-9a-f]{64}$/i.test(String(s || ''));
}

export function normalizeHex64(s) {
  const t = String(s || '').trim().toLowerCase();
  return isHex64(t) ? t : null;
}

export function hexFromBuffer(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Domain-separated "publicKey" teaching stand-in.
 * Pass digestFn for Node/tests: async (bytes: Uint8Array) => ArrayBuffer|Uint8Array|hex
 */
export async function derivePk(secretHex, domain = DOMAIN_PK, digestFn) {
  const sk = String(secretHex || '').toLowerCase();
  const payload = `${domain}:${sk}`;
  if (digestFn) {
    const out = await digestFn(payload);
    if (typeof out === 'string') return out.toLowerCase();
    return hexFromBuffer(out);
  }
  const dig = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
  return hexFromBuffer(dig);
}

/** Sync teaching hash for vitest (not crypto.subtle). */
export function derivePkSync(secretHex, domain = DOMAIN_PK) {
  const sk = String(secretHex || '').toLowerCase();
  const payload = `${domain}:${sk}`;
  let h = 2166136261;
  for (let i = 0; i < payload.length; i++) {
    h ^= payload.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Expand to 64 hex via two FNV passes (teaching only)
  let h2 = 2166136261;
  const flipped = payload.split('').reverse().join('') + String(h >>> 0);
  for (let i = 0; i < flipped.length; i++) {
    h2 ^= flipped.charCodeAt(i);
    h2 = Math.imul(h2, 16777619);
  }
  const a = (h >>> 0).toString(16).padStart(8, '0');
  const b = (h2 >>> 0).toString(16).padStart(8, '0');
  return (a + b + a + b + b + a + a + b).slice(0, 64);
}

export function emptyForgeState() {
  return {
    phase: 'idle',
    ownerPk: null,
    forged: false,
    log: [],
    aliceClaim: null,
    malloryClaim: '',
    safe: {
      ownerDerived: null,
      aliceSk: null,
      held: false,
    },
  };
}

export function emptyStudioState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    sk: null,
    posts: [],
    score: {},
    forge: emptyForgeState(),
    updatedAt: null,
  };
}

function normalizePost(p) {
  if (!p || typeof p !== 'object') return null;
  const id = String(p.id || '');
  const body = String(p.body || '').slice(0, 280);
  const ownerPk = normalizeHex64(p.ownerPk) || String(p.ownerPk || '').toLowerCase().slice(0, 64);
  if (!id || !body) return null;
  return {
    id,
    seq: Number(p.seq) || 0,
    body,
    ownerPk,
    ts: Number(p.ts) || Date.now(),
  };
}

function normalizeForge(raw) {
  const base = emptyForgeState();
  if (!raw || typeof raw !== 'object') return base;
  const phase = JOURNEY_PHASES.includes(raw.phase) ? raw.phase : 'idle';
  const ownerPk = normalizeHex64(raw.ownerPk);
  const log = Array.isArray(raw.log)
    ? raw.log.map(String).filter(Boolean).slice(0, 40)
    : [];
  const safeIn = raw.safe && typeof raw.safe === 'object' ? raw.safe : {};
  return {
    phase,
    ownerPk,
    forged: Boolean(raw.forged),
    log,
    aliceClaim: normalizeHex64(raw.aliceClaim) || ownerPk,
    malloryClaim: String(raw.malloryClaim || '').slice(0, 128),
    safe: {
      ownerDerived: normalizeHex64(safeIn.ownerDerived),
      aliceSk: normalizeHex64(safeIn.aliceSk),
      held: Boolean(safeIn.held),
    },
  };
}

function normalizeScore(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out = {};
  for (const [k, v] of Object.entries(raw)) {
    if (v) out[String(k)] = true;
  }
  return out;
}

/**
 * Normalize any persisted / imported / legacy blob into schema v2.
 */
export function normalizeStudioState(raw) {
  const base = emptyStudioState();
  if (!raw || typeof raw !== 'object') return base;

  // Legacy: bare posts array
  if (Array.isArray(raw)) {
    return {
      ...base,
      posts: raw.map(normalizePost).filter(Boolean).slice(0, 200),
    };
  }

  const posts = Array.isArray(raw.posts)
    ? raw.posts.map(normalizePost).filter(Boolean).slice(0, 200)
    : [];
  const sk = normalizeHex64(raw.sk);
  return {
    schemaVersion: SCHEMA_VERSION,
    sk,
    posts,
    score: normalizeScore(raw.score),
    forge: normalizeForge(raw.forge),
    updatedAt: raw.updatedAt || null,
  };
}

/** Scorecard health 0–100, or null if nothing checked. */
export function computeScoreHealth(score, items) {
  const map = score || {};
  let safeN = 0;
  let unsafeN = 0;
  let safeMax = 0;
  let unsafeMax = 0;
  for (const it of items || []) {
    const checked = Boolean(map[it.id]);
    if (it.kind === 'safe') {
      safeMax += 1;
      if (checked) safeN += 1;
    } else if (it.kind === 'unsafe') {
      unsafeMax += 1;
      if (checked) unsafeN += 1;
    }
  }
  const totalChecked = safeN + unsafeN;
  if (totalChecked === 0) {
    return { health: null, safeN, unsafeN, safeMax, unsafeMax };
  }
  let health = Math.round(safeN * 25 - unsafeN * 30 + 40);
  health = Math.max(0, Math.min(100, health));
  return { health, safeN, unsafeN, safeMax, unsafeMax };
}

export function forgeCanBypass(ownerPk, claimPk) {
  const o = normalizeHex64(ownerPk);
  const c = normalizeHex64(claimPk);
  if (!o || !c) return { ok: false, reason: 'missing' };
  return { ok: o === c, reason: o === c ? 'match' : 'mismatch' };
}

export function buildExportDocument(state, meta = {}) {
  const normalized = normalizeStudioState(state);
  return {
    kind: EXPORT_KIND,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    lab: 'Midnight GrokBot Agent · Auth Forge Studio',
    note: 'LOCAL educational snapshot — not on-chain. May contain board secret + posts; treat as sensitive.',
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
      : data.posts || data.score || data.sk || data.forge
        ? data
        : Array.isArray(data)
          ? { posts: data }
          : null;
  if (!candidate) {
    return {
      ok: false,
      state: null,
      error: `Expected kind ${EXPORT_KIND} or a raw { sk, posts, score, forge } snapshot`,
    };
  }
  const state = normalizeStudioState(candidate);
  if (!state.posts.length && !Object.keys(state.score).length && !state.sk && state.forge.phase === 'idle') {
    return { ok: false, state: null, error: 'Import has no auth-lab data' };
  }
  return { ok: true, state, error: null };
}
