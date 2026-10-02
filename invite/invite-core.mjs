/**
 * Sealed Invite — pure helpers (testable).
 * Teaching stand-ins for private RSVP / capacity proofs. Not Compact. Not on-chain.
 */

export const DOMAIN = 'sealed-invite:v1';
export const DOMAIN_INV = 'sealed-invite:invite:v1';
export const DOMAIN_RSVP = 'sealed-invite:rsvp:v1';
export const STORAGE_KEY = 'mn-sealed-invite-v1';
export const DRAFT_KEY = 'mn-sealed-invite-draft-v1';
export const SCHEMA_VERSION = 2;
export const DONATE_ADDR =
  'addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v';
export const EXPORT_KIND = 'midnight-lab.sealed-invite';
export const RING_CIRC = 2 * Math.PI * 52;

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

export async function sha256Hex(text, digestFn) {
  if (digestFn) return digestFn(text);
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function inviteCommit(capacity, venue, salt, digestFn) {
  const payload = `${DOMAIN_INV}|${Number(capacity)}|${venue}|${salt}`;
  return sha256Hex(payload, digestFn);
}

export async function rsvpCommit(name, plusOnes, inviteId, salt, digestFn) {
  const payload = `${DOMAIN_RSVP}|${inviteId}|${name}|${Number(plusOnes)}|${salt}`;
  return sha256Hex(payload, digestFn);
}

export function seatsUsed(inv) {
  return (inv?.rsvps || []).reduce((n, r) => n + 1 + (Number(r.plusOnes) || 0), 0);
}

export function inviteStats(invites) {
  const list = invites || [];
  const rsvps = list.reduce((n, i) => n + (i.rsvps?.length || 0), 0);
  const admitted = list.reduce(
    (n, i) => n + (i.rsvps || []).filter((r) => r.admitted).length,
    0,
  );
  const sealed = list.filter((i) => i.disclosure === 'sealed').length;
  return { invites: list.length, rsvps, admitted, sealed, disclosed: list.length - sealed };
}

/** Simulated: seatsUsed + guest seats <= capacity */
export function proveSeatsRemain(invite, rsvp) {
  if (!invite) return { ok: false, error: 'no invite' };
  const used = seatsUsed(invite);
  const guest = rsvp ? 1 + (Number(rsvp.plusOnes) || 0) : 0;
  // If proving a pending RSVP not yet counted, include it; if already in list, used already counts it
  const alreadyIn = rsvp && (invite.rsvps || []).some((r) => r.id === rsvp.id);
  const projected = alreadyIn ? used : used + guest;
  if (projected <= Number(invite.capacity)) {
    return { ok: true, used: projected, capacity: Number(invite.capacity), remaining: Number(invite.capacity) - projected };
  }
  return { ok: false, error: 'over capacity', used: projected, capacity: Number(invite.capacity) };
}

export function emptyStudioState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    invites: [],
    draft: null,
    updatedAt: null,
  };
}

function normalizeRsvp(r) {
  if (!r || typeof r !== 'object') return null;
  const disclosure = ['sealed', 'range', 'full'].includes(r.disclosure) ? r.disclosure : 'sealed';
  const out = {
    id: String(r.id || ''),
    name: String(r.name || ''),
    plusOnes: Number(r.plusOnes) || 0,
    tag: String(r.tag || ''),
    salt: String(r.salt || ''),
    commitment: String(r.commitment || ''),
    createdAt: String(r.createdAt || ''),
    disclosure,
  };
  if (r.admitted) out.admitted = true;
  return out.id ? out : null;
}

function normalizeInvite(i) {
  if (!i || typeof i !== 'object') return null;
  const disclosure = ['sealed', 'range', 'full'].includes(i.disclosure) ? i.disclosure : 'sealed';
  const status = i.status === 'closed' ? 'closed' : 'open';
  const out = {
    id: String(i.id || ''),
    title: String(i.title || ''),
    when: String(i.when || ''),
    host: String(i.host || '@anon'),
    capacity: Number(i.capacity) || 0,
    venue: String(i.venue || ''),
    salt: String(i.salt || ''),
    commitment: String(i.commitment || ''),
    createdAt: String(i.createdAt || ''),
    status,
    disclosure,
    rsvps: Array.isArray(i.rsvps) ? i.rsvps.map(normalizeRsvp).filter(Boolean).slice(0, 120) : [],
  };
  return out.id ? out : null;
}

export function normalizeStudioState(raw) {
  const base = emptyStudioState();
  if (!raw || typeof raw !== 'object') return base;
  const source = Array.isArray(raw) ? { invites: raw } : raw;
  const invites = Array.isArray(source.invites)
    ? source.invites.map(normalizeInvite).filter(Boolean).slice(0, 60)
    : [];
  let draft = source.draft && typeof source.draft === 'object' ? source.draft : null;
  if (draft && !draft.commitment) draft = null;
  return {
    schemaVersion: SCHEMA_VERSION,
    invites,
    draft,
    updatedAt: source.updatedAt || null,
  };
}

export function buildExportDocument(state, meta = {}) {
  const normalized = normalizeStudioState(state);
  return {
    kind: EXPORT_KIND,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    lab: 'Midnight GrokBot Agent · Sealed Invite Studio',
    note: 'LOCAL educational snapshot — not on-chain. Contains capacity/venue/guest names; treat as sensitive.',
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
      : Array.isArray(data.invites) || Array.isArray(data)
        ? Array.isArray(data)
          ? { invites: data }
          : data
        : null;
  if (!candidate) {
    return {
      ok: false,
      state: null,
      error: `Expected kind ${EXPORT_KIND} or a raw { invites } snapshot`,
    };
  }
  const state = normalizeStudioState(candidate);
  if (!state.invites.length && !state.draft) {
    return { ok: false, state: null, error: 'Import has no invites' };
  }
  return { ok: true, state, error: null };
}
