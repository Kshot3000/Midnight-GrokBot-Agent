/**
 * Night Market — pure helpers (testable).
 * Teaching stand-ins for sealed listings / private bids. Not Compact. Not on-chain.
 */

export const DOMAIN = 'night-market:v1';
export const DOMAIN_LIST = 'night-market:listing:v1';
export const DOMAIN_BID = 'night-market:bid:v1';
export const STORAGE_KEY = 'mn-night-market-v1';
export const DRAFT_KEY = 'mn-night-market-draft-v1';
export const SCHEMA_VERSION = 2;
export const DONATE_ADDR =
  'addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v';
export const EXPORT_KIND = 'midnight-lab.night-market';

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

export async function listingCommit(reserve, details, salt, digestFn) {
  const payload = `${DOMAIN_LIST}|${Number(reserve).toFixed(4)}|${details}|${salt}`;
  return sha256Hex(payload, digestFn);
}

export async function bidCommit(amount, listingId, salt, digestFn) {
  const payload = `${DOMAIN_BID}|${listingId}|${Number(amount).toFixed(4)}|${salt}`;
  return sha256Hex(payload, digestFn);
}

export function marketStats(listings) {
  const list = listings || [];
  const bids = list.reduce((n, l) => n + (l.bids?.length || 0), 0);
  const awarded = list.filter((l) => l.status === 'awarded').length;
  const sealed = list.filter((l) => l.disclosure === 'sealed').length;
  return { listings: list.length, bids, awarded, sealed, disclosed: list.length - sealed };
}

/** Simulated: bid.amount >= listing.reserve */
export function proveBidClearsReserve(listing, bid) {
  if (!listing || !bid) return { ok: false, error: 'missing listing or bid' };
  if (Number(bid.amount) >= Number(listing.reserve)) return { ok: true };
  return { ok: false, error: 'bid below reserve' };
}

export function emptyStudioState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    listings: [],
    draft: null,
    updatedAt: null,
  };
}

function normalizeBid(b) {
  if (!b || typeof b !== 'object') return null;
  const disclosure = ['sealed', 'range', 'full'].includes(b.disclosure) ? b.disclosure : 'sealed';
  const out = {
    id: String(b.id || ''),
    amount: Number(b.amount) || 0,
    handle: String(b.handle || '@anon'),
    salt: String(b.salt || ''),
    commitment: String(b.commitment || ''),
    createdAt: String(b.createdAt || ''),
    disclosure,
  };
  if (b.isWinner) out.isWinner = true;
  return out.id ? out : null;
}

function normalizeListing(l) {
  if (!l || typeof l !== 'object') return null;
  const disclosure = ['sealed', 'range', 'full'].includes(l.disclosure) ? l.disclosure : 'sealed';
  const status = l.status === 'awarded' ? 'awarded' : 'open';
  const out = {
    id: String(l.id || ''),
    title: String(l.title || ''),
    category: String(l.category || ''),
    seller: String(l.seller || '@anon'),
    reserve: Number(l.reserve) || 0,
    details: String(l.details || ''),
    salt: String(l.salt || ''),
    commitment: String(l.commitment || ''),
    createdAt: String(l.createdAt || ''),
    status,
    disclosure,
    bids: Array.isArray(l.bids) ? l.bids.map(normalizeBid).filter(Boolean).slice(0, 80) : [],
  };
  if (l.winnerBidId) out.winnerBidId = String(l.winnerBidId);
  return out.id ? out : null;
}

export function normalizeStudioState(raw) {
  const base = emptyStudioState();
  if (!raw || typeof raw !== 'object') return base;
  const source = Array.isArray(raw) ? { listings: raw } : raw;
  const listings = Array.isArray(source.listings)
    ? source.listings.map(normalizeListing).filter(Boolean).slice(0, 60)
    : [];
  let draft = source.draft && typeof source.draft === 'object' ? source.draft : null;
  if (draft && !draft.commitment) draft = null;
  return {
    schemaVersion: SCHEMA_VERSION,
    listings,
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
    lab: 'Midnight GrokBot Agent · Night Market Studio',
    note: 'LOCAL educational snapshot — not on-chain. Contains reserves/bids/salts; treat as sensitive.',
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
      : Array.isArray(data.listings) || Array.isArray(data)
        ? Array.isArray(data)
          ? { listings: data }
          : data
        : null;
  if (!candidate) {
    return {
      ok: false,
      state: null,
      error: `Expected kind ${EXPORT_KIND} or a raw { listings } snapshot`,
    };
  }
  const state = normalizeStudioState(candidate);
  if (!state.listings.length && !state.draft) {
    return { ok: false, state: null, error: 'Import has no listings' };
  }
  return { ok: true, state, error: null };
}
