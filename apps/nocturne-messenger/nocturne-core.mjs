/**
 * Nocturne Messenger — pure helpers (testable).
 * Teaching stand-ins for sealed DMs / commitments. Not a relay. Not Compact. Not on-chain.
 */

export const DOMAIN = 'nocturne-messenger:v1';
export const STORAGE_KEY = 'mn-nocturne-messenger-v1';
export const SCHEMA_VERSION = 2;
export const DONATE_ADDR =
  'addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v';
export const EXPORT_KIND = 'midnight-lab.nocturne-messenger';

export const PHASES = ['idle', 'identity', 'thread', 'sealed', 'committed', 'revealed'];

export function shortHex(h, n = 10) {
  if (!h || h.length < n * 2) return h || '—';
  return h.slice(0, n) + '…' + h.slice(-4);
}

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function hex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function sha256Hex(text, digestFn) {
  if (digestFn) return digestFn(text);
  const dig = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return hex(dig);
}

/** Clean handle: 2–24 [a-z0-9_], strip leading @ */
export function cleanHandle(handle) {
  return String(handle || '')
    .trim()
    .replace(/^@/, '')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 24);
}

export function messageCommitPayload(threadId, handle, salt, body) {
  return `nocturne:msg:${threadId}:${handle}:${salt}:${body}`;
}

export function deviceCommitPayload(handle, salt, wrapped) {
  return `nocturne:device:${handle}:${salt}:${wrapped ? 'wrapped' : 'open'}`;
}

export function threadStats(threads) {
  let veiled = 0;
  let commits = 0;
  let messages = 0;
  for (const msgs of Object.values(threads || {})) {
    for (const m of msgs || []) {
      messages += 1;
      if (m.veiled && !m.revealed) veiled += 1;
      if (m.commit) commits += 1;
    }
  }
  return { messages, veiled, commits, threads: Object.keys(threads || {}).length };
}

export function emptyStudioState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    identity: null,
    activeThreadId: null,
    threads: {},
    lastEnvelope: null,
    phase: 'idle',
    updatedAt: null,
  };
}

function normalizeMsg(m) {
  if (!m || typeof m !== 'object') return null;
  return {
    id: String(m.id || ''),
    from: String(m.from || ''),
    body: String(m.body || ''),
    commit: String(m.commit || ''),
    salt: String(m.salt || ''),
    ts: Number(m.ts) || 0,
    mine: Boolean(m.mine),
    revealed: Boolean(m.revealed),
    veiled: Boolean(m.veiled),
  };
}

function normalizeIdentity(id) {
  if (!id || typeof id !== 'object' || !id.handle) return null;
  return {
    handle: cleanHandle(id.handle) || String(id.handle),
    commit: String(id.commit || ''),
    sealedAt: String(id.sealedAt || ''),
    passWrapped: Boolean(id.passWrapped),
  };
}

export function normalizeStudioState(raw) {
  const base = emptyStudioState();
  if (!raw || typeof raw !== 'object') return base;
  const threadsIn = raw.threads && typeof raw.threads === 'object' && !Array.isArray(raw.threads) ? raw.threads : {};
  const threads = {};
  for (const [tid, msgs] of Object.entries(threadsIn)) {
    const list = Array.isArray(msgs)
      ? msgs.map(normalizeMsg).filter((m) => m && m.id).slice(0, 200)
      : [];
    threads[String(tid)] = list;
  }
  let phase = typeof raw.phase === 'string' && PHASES.includes(raw.phase) ? raw.phase : 'idle';
  const identity = normalizeIdentity(raw.identity);
  let activeThreadId = raw.activeThreadId != null ? String(raw.activeThreadId) : null;
  if (activeThreadId && !(activeThreadId in threads) && !['moon', 'ada', 'oracle', 'veil'].includes(activeThreadId)) {
    activeThreadId = null;
  }
  let lastEnvelope = null;
  if (raw.lastEnvelope && typeof raw.lastEnvelope === 'object') {
    lastEnvelope = {
      commit: String(raw.lastEnvelope.commit || ''),
      body: String(raw.lastEnvelope.body || ''),
      salt: String(raw.lastEnvelope.salt || ''),
      peer: String(raw.lastEnvelope.peer || ''),
      ts: Number(raw.lastEnvelope.ts) || 0,
    };
  }
  if (!identity && phase !== 'idle') phase = 'idle';
  return {
    schemaVersion: SCHEMA_VERSION,
    identity,
    activeThreadId,
    threads,
    lastEnvelope,
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
    lab: 'Midnight GrokBot Agent · Nocturne Messenger Studio',
    note: 'LOCAL educational snapshot — not on-chain. Contains message bodies/salts; treat as sensitive. Not a relay.',
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
      : data.identity || data.threads
        ? data
        : null;
  if (!candidate) {
    return {
      ok: false,
      state: null,
      error: `Expected kind ${EXPORT_KIND} or a raw { identity, threads } snapshot`,
    };
  }
  const state = normalizeStudioState(candidate);
  if (!state.identity && !Object.keys(state.threads).length) {
    return { ok: false, state: null, error: 'Import has no identity or threads' };
  }
  return { ok: true, state, error: null };
}
