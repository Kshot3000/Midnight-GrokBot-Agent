/**
 * Classifies Preprod wallet sync stall symptoms from midnight-docs#1381.
 * Only restates causes already published on https://docs.midnight.network/guides/networks-and-environments
 * Does not call the wallet SDK, indexer, or node, and does not invent APIs.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1381
 * Official: https://docs.midnight.network/guides/networks-and-environments
 * Official: https://docs.midnight.network/sdks/official/wallet-developer-guide
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_SYNC_STALL = 'https://github.com/midnightntwrk/midnight-docs/issues/1381';
export const OFFICIAL_NETWORKS =
  'https://docs.midnight.network/guides/networks-and-environments';
export const OFFICIAL_WALLET_GUIDE =
  'https://docs.midnight.network/sdks/official/wallet-developer-guide';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {string} symptom free-text log line or symptom
 */
export function classifyWalletSyncStall(symptom) {
  const text = String(symptom ?? '').toLowerCase();
  const base = {
    upstream: UPSTREAM_SYNC_STALL,
    official: OFFICIAL_NETWORKS,
    credit: CREDIT,
  };

  if (
    text.includes('non-linear') ||
    text.includes('inserted non-linearly') ||
    text.includes('dust generation tree') ||
    text.includes('zswap commitment') ||
    text.includes('dust commitment tree')
  ) {
    return {
      ...base,
      kind: 'non-portable-indexer-state',
      cause:
        'Saved sync state from the old indexer is not portable; event and transaction ids differ between indexers.',
      action:
        'Discard that state and sync from genesis. Do not shift cursors by hand. A full Preprod sync takes over an hour.',
    };
  }

  if (
    text.includes('timeout') &&
    (text.includes('after a transaction') || text.includes('funds arrived'))
  ) {
    return {
      ...base,
      kind: 'idle-subscription-lag',
      cause:
        'On an idle subscription the indexer sends unshielded sync progress less often, backing off to about 4 minutes (up to about 5 with jitter).',
      action:
        'Wait for the expected balance or spendable DUST, or allow more than 5 minutes, instead of a short synced-state timeout.',
    };
  }

  if (
    text.includes('issynced') ||
    text.includes('is synced') ||
    text.includes('never becomes true') ||
    text.includes('never finishes')
  ) {
    return {
      ...base,
      kind: 'issynced-gates-all-three',
      cause:
        'isSynced is true only when shielded, unshielded, and DUST progress are all strictly complete.',
      action:
        'Wait for all three. A local devnet sync is much faster than Preprod. Use waitForSyncedState() from the wallet guide.',
    };
  }

  return {
    ...base,
    kind: 'unknown',
    cause: 'Symptom does not match a documented Preprod sync stall in the networks guide.',
    action: 'Re-check the official troubleshooting table before inventing a workaround.',
  };
}

const isMain =
  process.argv[1] &&
  import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));

if (isMain || import.meta.url === `file://${process.argv[1]}`) {
  const nonLinear = classifyWalletSyncStall(
    'values inserted non-linearly into dust commitment tree',
  );
  const lag = classifyWalletSyncStall(
    'wallet sync timeout right after a transaction although the funds arrived',
  );
  const gates = classifyWalletSyncStall('isSynced never becomes true on Preprod');
  const ok =
    nonLinear.kind === 'non-portable-indexer-state' &&
    lag.kind === 'idle-subscription-lag' &&
    gates.kind === 'issynced-gates-all-three';
  if (!ok) {
    console.error(JSON.stringify({ nonLinear, lag, gates }, null, 2));
    process.exit(1);
  }
  console.log(
    JSON.stringify(
      { ok: true, kinds: [nonLinear.kind, lag.kind, gates.kind], credit: CREDIT },
      null,
      2,
    ),
  );
}
