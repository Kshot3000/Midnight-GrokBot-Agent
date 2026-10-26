/**
 * LOCAL-TRUE classifier for Preprod wallet sync stall symptoms.
 * Upstream: midnightntwrk/midnight-docs#1381
 * Does not call indexer, node, or wallet SDK. Does not invent APIs.
 *
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1,
 * DApp Connector 4.0.1, proof-server 8.1.0, wallet-sdk 1.2.0.
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1381';

export const OFFICIAL = {
  matrix: 'https://docs.midnight.network/relnotes/support-matrix',
  walletGuide: 'https://docs.midnight.network/sdks/official/wallet-dev-guide',
};

/**
 * @param {object} snapshot
 * @param {boolean} [snapshot.isConnected]
 * @param {boolean} [snapshot.isSynced]
 * @param {number} [snapshot.appliedIndex]
 * @param {number} [snapshot.highestRelevantWalletIndex]
 * @param {string} [snapshot.error]
 * @returns {'silent-dust-subscription'|'dust-tree-nonlinear'|'sync-never-starts'|'unknown'}
 */
export function classifyPreprodWalletSyncStall(snapshot = {}) {
  const err = String(snapshot.error || '').toLowerCase();
  if (err.includes('non-linear') || err.includes('expected index') || err.includes('commitment tree')) {
    return 'dust-tree-nonlinear';
  }
  const behind =
    typeof snapshot.appliedIndex === 'number' &&
    typeof snapshot.highestRelevantWalletIndex === 'number' &&
    snapshot.appliedIndex < snapshot.highestRelevantWalletIndex;
  if (snapshot.isConnected === true && behind) {
    return 'silent-dust-subscription';
  }
  if (snapshot.isSynced === false && !snapshot.isConnected) {
    return 'sync-never-starts';
  }
  return 'unknown';
}

export const CREDIT = `Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation`;
