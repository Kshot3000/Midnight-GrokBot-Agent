/**
 * Private Ballot — pure helpers (testable).
 * Teaching stand-ins for commits/nullifiers/tallies. Not Compact. Not on-chain.
 */

export const DOMAIN = 'private-ballot:v1';
export const STORAGE_KEY = 'mn-private-ballot-v1';
export const SCHEMA_VERSION = 2;
export const DONATE_ADDR =
  'addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v';
export const EXPORT_KIND = 'midnight-lab.private-ballot';

/** Parse poll options textarea → 2–6 trimmed unique-ish labels. */
export function parseOptions(raw) {
  const lines = String(raw || '')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const seen = new Set();
  const out = [];
  for (const line of lines) {
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(line.slice(0, 48));
    if (out.length >= 6) break;
  }
  return out;
}

export function acceptedVotesForBallot(votes, ballotId) {
  return (votes || []).filter((v) => v.ballotId === ballotId && !v.rejected);
}

/** First-class double-vote detection on nullifier. */
export function findDuplicateNullifier(votes, ballotId, nullifier) {
  return (votes || []).some(
    (v) =>
      v.ballotId === ballotId &&
      v.nullifier === nullifier &&
      !v.rejected,
  );
}

/** Detect duplicate nullifiers inside an accepted set (tally gate). */
export function hasNullifierCollision(votes) {
  const seen = new Set();
  for (const v of votes || []) {
    if (seen.has(v.nullifier)) return true;
    seen.add(v.nullifier);
  }
  return false;
}

/** Aggregate choice counts from accepted votes (local openings — teaching only). */
export function aggregateTally(options, votes) {
  const tally = {};
  for (const o of options || []) tally[o] = 0;
  for (const v of votes || []) {
    if (v.rejected) continue;
    const label = v.choiceLabel;
    if (label in tally) tally[label] += 1;
    else tally[label] = (tally[label] || 0) + 1;
  }
  return tally;
}

export function emptyStudioState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    ballots: [],
    votes: [],
    rejectCount: 0,
    activeId: null,
    vault: {},
    updatedAt: null,
  };
}

/**
 * Normalize any persisted / imported blob into schema v2.
 * Strips unknown fields from top-level; keeps ballot/vote shapes intact.
 */
export function normalizeStudioState(raw) {
  const base = emptyStudioState();
  if (!raw || typeof raw !== 'object') return base;
  const ballots = Array.isArray(raw.ballots) ? raw.ballots.filter(Boolean) : [];
  const votes = Array.isArray(raw.votes) ? raw.votes.filter(Boolean) : [];
  const vault =
    raw.vault && typeof raw.vault === 'object' && !Array.isArray(raw.vault)
      ? { ...raw.vault }
      : {};
  let activeId = raw.activeId ?? null;
  if (activeId && !ballots.some((b) => b.id === activeId)) {
    activeId = ballots[0]?.id ?? null;
  }
  return {
    schemaVersion: SCHEMA_VERSION,
    ballots: ballots.slice(0, 40),
    votes: votes.slice(0, 200),
    rejectCount: Number(raw.rejectCount) || 0,
    activeId,
    vault,
    updatedAt: raw.updatedAt || null,
  };
}

export function buildExportDocument(state, meta = {}) {
  const normalized = normalizeStudioState(state);
  return {
    kind: EXPORT_KIND,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    lab: 'Midnight GrokBot Agent · Private Ballot Studio',
    note: 'LOCAL educational snapshot — not on-chain. Contains vote openings if present; treat as sensitive.',
    donate: DONATE_ADDR,
    handle: '@kshot9000',
    ...meta,
    state: normalized,
  };
}

/**
 * Validate import JSON. Returns { ok, state, error }.
 */
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
  // Accept wrapped export or raw state
  const candidate =
    data.kind === EXPORT_KIND && data.state
      ? data.state
      : data.ballots || data.votes
        ? data
        : null;
  if (!candidate) {
    return {
      ok: false,
      state: null,
      error: `Expected kind ${EXPORT_KIND} or a raw { ballots, votes } snapshot`,
    };
  }
  const state = normalizeStudioState(candidate);
  if (!state.ballots.length && !state.votes.length) {
    return { ok: false, state: null, error: 'Import has no ballots or votes' };
  }
  return { ok: true, state, error: null };
}

/** Merge vault salts preferring next, then prev. */
export function mergeVault(prevVault, nextVault) {
  const out = { ...(prevVault || {}) };
  for (const [id, v] of Object.entries(nextVault || {})) {
    if (!out[id]) out[id] = v;
    else if (!out[id].eligSalt && v?.eligSalt) out[id] = { ...out[id], eligSalt: v.eligSalt };
    else if (v?.eligSalt) out[id] = { ...out[id], eligSalt: v.eligSalt };
  }
  return out;
}
