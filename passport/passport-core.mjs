/**
 * Veil Passport — pure helpers (testable).
 * Teaching stand-ins for confidential credentials / selective disclosure. Not Compact. Not on-chain.
 */

export const DOMAIN = 'veil-passport:v1';
export const STORAGE_KEY = 'mn-veil-passport-v1';
export const SCHEMA_VERSION = 2;
export const DONATE_ADDR =
  'addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v';
export const EXPORT_KIND = 'midnight-lab.veil-passport';
export const CLAIM_KEYS = ['displayName', 'age', 'role', 'membership', 'region'];
export const CLAIM_LABELS = {
  displayName: 'Name',
  age: 'Age',
  role: 'Role',
  membership: 'Membership',
  region: 'Region',
};

export function short(h, n = 8) {
  if (!h) return '—';
  return h.length <= n * 2 ? h : h.slice(0, n) + '…' + h.slice(-n);
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

export function claimCommitPayload(claims, salt) {
  return `${DOMAIN}|${claims.displayName}|${claims.age}|${claims.role}|${claims.membership}|${claims.region || ''}|${salt}`;
}

export function phaseOf(p) {
  if (!p) return 'idle';
  if (p.revoked) return 'revoked';
  if (p.lastPredicate || (p.disclosed && p.disclosed.length)) return 'proven';
  if (p.presented) return 'presented';
  return 'issued';
}

export function passportStats(passports) {
  const list = passports || [];
  return {
    issued: list.length,
    presented: list.filter((p) => p.presented).length,
    proven: list.filter((p) => p.lastPredicate || (p.disclosed && p.disclosed.length)).length,
    revoked: list.filter((p) => p.revoked).length,
  };
}

function normalizePredicate(pred) {
  if (!pred || typeof pred !== 'object') return undefined;
  return {
    kind: String(pred.kind || ''),
    detail: String(pred.detail || ''),
    ok: Boolean(pred.ok),
    pi: String(pred.pi || ''),
  };
}

function normalizePassport(p) {
  if (!p || typeof p !== 'object') return null;
  const disclosed = Array.isArray(p.disclosed)
    ? p.disclosed.map(String).filter((k) => CLAIM_KEYS.includes(k))
    : [];
  const out = {
    id: String(p.id || ''),
    displayName: String(p.displayName || ''),
    age: Number(p.age) || 0,
    role: String(p.role || ''),
    membership: String(p.membership || ''),
    region: String(p.region || ''),
    salt: String(p.salt || ''),
    holderSecret: String(p.holderSecret || ''),
    commit: String(p.commit || ''),
    issuerSig: String(p.issuerSig || ''),
    issuedAt: String(p.issuedAt || ''),
    presented: Boolean(p.presented),
    revoked: Boolean(p.revoked),
    disclosed,
  };
  if (p.revokeNullifier) out.revokeNullifier = String(p.revokeNullifier);
  if (p.lastPredicate) out.lastPredicate = normalizePredicate(p.lastPredicate);
  if (p.verified != null) out.verified = Boolean(p.verified);
  return out.id ? out : null;
}

export function emptyStudioState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    passports: [],
    activeId: null,
    updatedAt: null,
  };
}

export function normalizeStudioState(raw) {
  const base = emptyStudioState();
  if (!raw || typeof raw !== 'object') return base;
  const source = Array.isArray(raw) ? { passports: raw } : raw;
  const passports = Array.isArray(source.passports)
    ? source.passports.map(normalizePassport).filter(Boolean).slice(0, 80)
    : [];
  let activeId = source.activeId != null ? String(source.activeId) : null;
  if (activeId && !passports.some((p) => p.id === activeId)) {
    activeId = passports[0]?.id || null;
  }
  return {
    schemaVersion: SCHEMA_VERSION,
    passports,
    activeId,
    updatedAt: source.updatedAt || null,
  };
}

export function buildExportDocument(state, meta = {}) {
  const normalized = normalizeStudioState(state);
  return {
    kind: EXPORT_KIND,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    lab: 'Midnight GrokBot Agent · Veil Passport Studio',
    note: 'LOCAL educational snapshot — not on-chain. Contains claim fields/salts/secrets; treat as sensitive.',
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
      : Array.isArray(data.passports) || Array.isArray(data)
        ? Array.isArray(data)
          ? { passports: data }
          : data
        : null;
  if (!candidate) {
    return {
      ok: false,
      state: null,
      error: `Expected kind ${EXPORT_KIND} or a raw { passports } snapshot`,
    };
  }
  const state = normalizeStudioState(candidate);
  if (!state.passports.length) {
    return { ok: false, state: null, error: 'Import has no passports' };
  }
  return { ok: true, state, error: null };
}
