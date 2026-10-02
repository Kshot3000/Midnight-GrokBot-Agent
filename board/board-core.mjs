/**
 * Shield Board — pure helpers (testable).
 * Teaching stand-ins for dual-state commitments / witness pk. Not Compact. Not on-chain.
 */

export const DOMAIN = 'shield-board:v1';
export const STORAGE_KEY = 'mn-shield-board-v2';
export const LEGACY_STORAGE_KEY = 'shield-board:dual:v1';
export const SCHEMA_VERSION = 2;
export const DONATE_ADDR =
  'addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v';
export const EXPORT_KIND = 'midnight-lab.shield-board';

export function bytesToHex(bytes) {
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function hexToBytes(hex) {
  const clean = String(hex || '').replace(/^0x/, '').toLowerCase();
  if (clean.length % 2) return new Uint8Array(0);
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return out;
}

export function pad32(ascii) {
  const enc = new TextEncoder().encode(ascii);
  const out = new Uint8Array(32);
  out.set(enc.slice(0, 32));
  return out;
}

export function short(hex, n = 8) {
  if (!hex) return '—';
  if (hex.length <= n * 2 + 1) return hex;
  return `${hex.slice(0, n)}…${hex.slice(-4)}`;
}

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Stats from posts array. */
export function postStats(posts) {
  const list = posts || [];
  return {
    posts: list.length,
    sealed: list.filter((p) => !p.disclosed).length,
    disclosed: list.filter((p) => p.disclosed).length,
  };
}

export function emptyStudioState(seedSecret = null) {
  return {
    schemaVersion: SCHEMA_VERSION,
    secret: seedSecret || '',
    seq: 0,
    posts: [],
    log: ['Shield Board ready — dual-state local-true.'],
    updatedAt: null,
  };
}

function normalizePost(p) {
  if (!p || typeof p !== 'object') return null;
  return {
    id: String(p.id || ''),
    commitment: String(p.commitment || ''),
    ownerPk: String(p.ownerPk || ''),
    seq: Number(p.seq) || 0,
    createdAt: Number(p.createdAt) || 0,
    disclosed: Boolean(p.disclosed),
    body: p.body != null ? String(p.body) : undefined,
  };
}

export function normalizeStudioState(raw) {
  const base = emptyStudioState();
  if (!raw || typeof raw !== 'object') return base;
  const posts = Array.isArray(raw.posts)
    ? raw.posts.map(normalizePost).filter((p) => p && p.id).slice(0, 200)
    : [];
  return {
    schemaVersion: SCHEMA_VERSION,
    secret: typeof raw.secret === 'string' ? raw.secret : '',
    seq: Number(raw.seq) || 0,
    posts,
    log: Array.isArray(raw.log) ? raw.log.map(String).slice(0, 60) : base.log,
    updatedAt: raw.updatedAt || null,
  };
}

export function buildExportDocument(state, meta = {}) {
  const normalized = normalizeStudioState(state);
  return {
    kind: EXPORT_KIND,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    lab: 'Midnight GrokBot Agent · Shield Board Studio',
    note: 'LOCAL educational snapshot — not on-chain. Contains local secret + private bodies if present; treat as sensitive.',
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
      : typeof data.secret === 'string' || Array.isArray(data.posts)
        ? data
        : null;
  if (!candidate) {
    return {
      ok: false,
      state: null,
      error: `Expected kind ${EXPORT_KIND} or a raw { secret, posts } snapshot`,
    };
  }
  const state = normalizeStudioState(candidate);
  if (!state.secret && !state.posts.length) {
    return { ok: false, state: null, error: 'Import has no secret or posts' };
  }
  return { ok: true, state, error: null };
}

/**
 * Domain-separated pk ≈ persistentHash([pad(domain), sk]).
 * digestFn: async (Uint8Array) => hex string (injectable for tests).
 */
export async function derivePk(secretHex, digestFn) {
  const digest =
    digestFn ||
    (async (bytes) => {
      const dig = await crypto.subtle.digest('SHA-256', bytes);
      return bytesToHex(new Uint8Array(dig));
    });

  const sk = hexToBytes(secretHex);
  if (sk.length !== 32) {
    const raw = new TextEncoder().encode(secretHex);
    const skHashHex = await digest(raw);
    const skHash = hexToBytes(skHashHex);
    const material = new Uint8Array(64);
    material.set(pad32(DOMAIN + ':pk'), 0);
    material.set(skHash.slice(0, 32), 32);
    return digest(material);
  }
  const material = new Uint8Array(64);
  material.set(pad32(DOMAIN + ':pk'), 0);
  material.set(sk, 32);
  return digest(material);
}

export async function commitmentOf(body, ownerPk, seq, digestFn) {
  const digest =
    digestFn ||
    (async (bytes) => {
      const dig = await crypto.subtle.digest('SHA-256', bytes);
      return bytesToHex(new Uint8Array(dig));
    });
  const enc = new TextEncoder();
  const payload = enc.encode(`${DOMAIN}|${seq}|${ownerPk}|${body}`);
  return digest(payload);
}

/** Owner check for disclose / take-down (MPS-0029 teaching). */
export function isOwner(post, myPkHex) {
  return Boolean(post && myPkHex && post.ownerPk === myPkHex);
}
