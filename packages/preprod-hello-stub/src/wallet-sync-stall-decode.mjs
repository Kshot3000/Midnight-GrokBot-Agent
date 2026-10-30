/**
 * Pure classifier for Preprod wallet-sync stall symptoms.
 * Quotes error strings from official docs and midnight-docs#1381.
 * No network calls. LOCAL-TRUE.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_ISSUE = 'https://github.com/midnightntwrk/midnight-docs/issues/1381';

export const OFFICIAL_PAGES = [
  'https://docs.midnight.network/guides/networks-and-environments',
  'https://docs.midnight.network/sdks/official/wallet-developer-guide',
  'https://docs.midnight.network/relnotes/support-matrix',
];

/**
 * Classify a log or error string against published Preprod sync symptoms.
 * @param {string} text
 * @returns {{ kind: string, hint: string, source: string } | null}
 */
export function classifyWalletSyncStall(text) {
  if (typeof text !== 'string' || !text) return null;
  const t = text.toLowerCase();

  if (t.includes('values inserted non-linearly') || t.includes('dust commitment tree') || t.includes('zswap commitment tree') || t.includes('dust generation tree')) {
    return {
      kind: 'non-portable-indexer-state',
      hint: 'Discard saved sync state from the retired Midnight-hosted indexer and sync from genesis. Do not shift cursors. Full Preprod first sync can take over an hour.',
      source: 'networks-and-environments',
    };
  }

  if (t.includes('waitforsyncedstate') || t.includes('issynced') && t.includes('never') || t.includes('sync never completes') || t.includes('facadestate.issynced')) {
    return {
      kind: 'sync-never-completes',
      hint: 'Distinguish connected from synced. Check proof server on :6300, Blockfrost token, and allow a long first sync on Preprod. See official wallet guide for waitForSyncedState().',
      source: 'midnight-docs#1381 + wallet-developer-guide',
    };
  }

  if (t.includes('dustwallet') || t.includes('dust channel') || t.includes('dust sync')) {
    return {
      kind: 'dust-channel',
      hint: 'Dust sync replays history. Confirm registration and wait for isSynced before expecting positive dust balance.',
      source: 'midnight-docs#1381 + wallet-developer-guide',
    };
  }

  if (t.includes('timeout') && (t.includes('sync') || t.includes('after a transaction'))) {
    return {
      kind: 'idle-subscription-lag',
      hint: 'Indexer may back off unshielded progress updates to ~4-5 minutes. Wait for expected balance or spendable DUST instead of a short timeout.',
      source: 'networks-and-environments',
    };
  }

  return null;
}

export default { classifyWalletSyncStall, UPSTREAM_ISSUE, OFFICIAL_PAGES };
