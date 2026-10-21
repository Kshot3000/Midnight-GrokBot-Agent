/**
 * Classify a Preprod DUST wallet sync that stays open but stops delivering events.
 * Does not connect to an indexer, wallet, or node. Does not invent APIs.
 * Does not claim to fix the public indexer or node.
 *
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/251
 * Related docs request: https://github.com/midnightntwrk/midnight-docs/issues/1381
 * Official DUST: https://docs.midnight.network/guides/manage-dust
 * Official error codes (170 InvalidDustSpendProof): https://docs.midnight.network/nodes/error-codes
 * Decode guide: https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors
 *
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/251';
export const RELATED_DOCS = 'https://github.com/midnightntwrk/midnight-docs/issues/1381';
export const OFFICIAL_DUST = 'https://docs.midnight.network/guides/manage-dust';
export const OFFICIAL_ERRORS = 'https://docs.midnight.network/nodes/error-codes';
export const OFFICIAL_DECODE = 'https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * Classify observed sync behaviour against servicedesk#251.
 * @param {{ isConnected?: boolean, appliedIndex?: number, highestRelevantWalletIndex?: number, eventsSince?: number, silenceSeconds?: number }} obs
 */
export function classifyDustSilentSubscription(obs = {}) {
  const isConnected = Boolean(obs.isConnected);
  const applied = Number(obs.appliedIndex ?? 0);
  const highest = Number(obs.highestRelevantWalletIndex ?? 0);
  const silence = Number(obs.silenceSeconds ?? 0);
  const behind = highest > applied;

  if (isConnected && behind && silence > 60) {
    return {
      ok: false,
      classification: 'silent-subscription-stall',
      title: 'DUST subscription open but silent while wallet is behind',
      hint: 'Matches servicedesk#251: wallet SDK 1.2.0 does not notice a quiet DUST subscription that stays open. progress.isConnected stays true. Official error codes note that building a transaction before every DUST event is synced can surface as 1010 Custom error 170 (InvalidDustSpendProof). Wait for events or drop and resubscribe. This lab does not fix the public indexer or node.',
      upstream: UPSTREAM,
      related: RELATED_DOCS,
      official: [OFFICIAL_DUST, OFFICIAL_ERRORS, OFFICIAL_DECODE],
      claim: 'classification only — not an indexer, node, or wallet SDK fix',
      credit: CREDIT,
    };
  }

  if (!isConnected && behind) {
    return {
      ok: true,
      classification: 'disconnected-while-behind',
      title: 'subscription closed while behind (expected recovery path)',
      hint: 'Connection drop clears isConnected and should resubscribe from appliedIndex. Official DUST troubleshooting covers waiting for sync before proving a fee spend.',
      upstream: UPSTREAM,
      official: OFFICIAL_DUST,
      credit: CREDIT,
    };
  }

  return {
    ok: true,
    classification: 'not-silent-stall',
    title: 'no silent-subscription stall observed',
    hint: 'Either the wallet is caught up, or the subscription is not both connected and silent for >60s.',
    upstream: UPSTREAM,
    official: OFFICIAL_DUST,
    credit: CREDIT,
  };
}

export const dustSilentCredit = CREDIT;

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const stall = classifyDustSilentSubscription({
    isConnected: true,
    appliedIndex: 100,
    highestRelevantWalletIndex: 5000,
    silenceSeconds: 120,
  });
  const recovered = classifyDustSilentSubscription({
    isConnected: false,
    appliedIndex: 100,
    highestRelevantWalletIndex: 5000,
  });
  if (!stall.ok && stall.classification === 'silent-subscription-stall' && recovered.ok) {
    console.log(JSON.stringify({ ok: true, classification: stall.classification, credit: CREDIT }, null, 2));
    process.exit(0);
  }
  console.error(JSON.stringify({ stall, recovered }, null, 2));
  process.exit(1);
}
