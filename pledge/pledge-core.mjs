/**
 * Veil Pledge — pure helpers (testable).
 * Teaching stand-ins for tip commitments / threshold proofs. Not Compact. Not on-chain.
 */

export const DOMAIN = 'veil-pledge:v1';
export const DOMAIN_COMMIT = 'veil-pledge:commit:v1';
export const STORAGE_KEY = 'mn-veil-pledge-v1';
export const DRAFT_KEY = 'mn-veil-pledge-draft-v1';
export const SCHEMA_VERSION = 2;
export const DONATE_ADDR =
  'addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v';
export const EXPORT_KIND = 'midnight-lab.veil-pledge';

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

/** Sync SHA-256 hex via injectable digest (tests) or Web Crypto. */
export async function sha256Hex(text, digestFn) {
  if (digestFn) return digestFn(text);
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Money fields: finite and non-negative, else 0. JSON `1e999` parses to
 *  Infinity and negative amounts used to pass normalize untouched, so a
 *  crafted import / localStorage blob could render "Infinity ADA", poison
 *  the vault sum, and prove any threshold trivially. Same guard as the
 *  escrow / night-market cores' finiteNonNeg. */
export function finiteNonNeg(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export async function commitHash(amount, note, salt, digestFn) {
  const payload = `${DOMAIN_COMMIT}|${finiteNonNeg(amount).toFixed(4)}|${note}|${salt}`;
  return sha256Hex(payload, digestFn);
}

export function pledgeStats(pledges) {
  const list = pledges || [];
  const sealed = list.filter((p) => p.disclosure === 'sealed').length;
  const sum = list.reduce((a, p) => a + finiteNonNeg(p.amount), 0);
  return { total: list.length, sealed, disclosed: list.length - sealed, sum };
}

/** Simulated threshold circuit: amount >= threshold (teaching only).
 *  Both sides must be positive finite amounts — an Infinity (or otherwise
 *  non-finite) pledge amount is not a proof. */
export function proveThreshold(pledge, threshold) {
  const thr = Number(threshold);
  if (!pledge) return { ok: false, error: 'no pledge' };
  if (!Number.isFinite(thr) || thr <= 0) return { ok: false, error: 'bad threshold' };
  const amount = Number(pledge.amount);
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: 'bad amount' };
  if (amount >= thr) return { ok: true, rangeMin: thr };
  return { ok: false, error: 'below threshold' };
}

export function emptyStudioState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    pledges: [],
    draft: null,
    updatedAt: null,
  };
}

function normalizePledge(p) {
  if (!p || typeof p !== 'object') return null;
  const disclosure = ['sealed', 'range', 'full'].includes(p.disclosure) ? p.disclosure : 'sealed';
  const out = {
    id: String(p.id || ''),
    handle: String(p.handle || '@anon'),
    commitment: String(p.commitment || ''),
    salt: String(p.salt || ''),
    amount: finiteNonNeg(p.amount),
    note: String(p.note || ''),
    createdAt: String(p.createdAt || ''),
    disclosure,
  };
  if (disclosure === 'range') {
    const rangeMin = finiteNonNeg(p.rangeMin);
    if (rangeMin > 0) out.rangeMin = rangeMin;
  }
  return out.id ? out : null;
}

/** Drafts used to pass normalize verbatim: a crafted draft whose amount
 *  was a string crashed renderDraftPreview (`amount.toFixed` is not a
 *  function) and broke the whole board render. Type every field; money
 *  goes through finiteNonNeg so amount is always a finite number. */
export function normalizeDraft(d) {
  if (!d || typeof d !== 'object' || Array.isArray(d)) return null;
  if (!d.commitment) return null;
  return {
    amount: finiteNonNeg(d.amount),
    note: String(d.note || ''),
    handle: String(d.handle || '@anon'),
    salt: String(d.salt || ''),
    commitment: String(d.commitment),
  };
}

export function normalizeStudioState(raw) {
  const base = emptyStudioState();
  if (!raw || typeof raw !== 'object') return base;
  const source = Array.isArray(raw) ? { pledges: raw } : raw;
  const pledges = Array.isArray(source.pledges)
    ? source.pledges.map(normalizePledge).filter(Boolean).slice(0, 100)
    : [];
  const draft = normalizeDraft(source.draft);
  return {
    schemaVersion: SCHEMA_VERSION,
    pledges,
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
    lab: 'Midnight GrokBot Agent · Veil Pledge Studio',
    note: 'LOCAL educational snapshot — not on-chain. Contains pledge amounts/notes/salts; treat as sensitive.',
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
      : Array.isArray(data.pledges) || Array.isArray(data)
        ? Array.isArray(data)
          ? { pledges: data }
          : data
        : null;
  if (!candidate) {
    return {
      ok: false,
      state: null,
      error: `Expected kind ${EXPORT_KIND} or a raw { pledges } snapshot`,
    };
  }
  const state = normalizeStudioState(candidate);
  if (!state.pledges.length && !state.draft) {
    return { ok: false, state: null, error: 'Import has no pledges' };
  }
  return { ok: true, state, error: null };
}
