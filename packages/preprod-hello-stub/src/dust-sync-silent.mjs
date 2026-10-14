/**
 * Classify a DUST wallet progress snapshot as a possible silent-stream stall.
 * Does not open a WebSocket, call an indexer, or claim to fix the wallet SDK.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/251
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, proof-server 8.1.0
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/251';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {{ isConnected?: boolean, appliedIndex?: bigint | number | string, highestRelevantWalletIndex?: bigint | number | string, silentSeconds?: number }} snap
 */
export function classifyDustSyncSilent(snap) {
  const connected = !!snap?.isConnected;
  const applied = BigInt(snap?.appliedIndex ?? 0);
  const highest = BigInt(snap?.highestRelevantWalletIndex ?? 0);
  const silent = Number(snap?.silentSeconds ?? 0);
  const behind = applied < highest;

  if (!connected) {
    return {
      ok: true,
      classification: 'disconnected',
      hint: 'isConnected is false; the SDK already treats the subscription as down.',
      upstream: UPSTREAM,
      credit: CREDIT,
    };
  }

  if (behind && silent >= 60) {
    return {
      ok: false,
      classification: 'possible-silent-stall',
      hint: 'DUST progress is behind and isConnected stayed true with no advance for >= 60s. Matches the silent open subscription reported in servicedesk#251. The wallet does not time out the stream itself.',
      upstream: UPSTREAM,
      claim: 'classification only — not a wallet, indexer, or node fix',
      credit: CREDIT,
    };
  }

  return {
    ok: true,
    classification: 'advancing-or-caught-up',
    hint: behind ? 'still behind but silence shorter than the note threshold' : 'caught up',
    upstream: UPSTREAM,
    credit: CREDIT,
  };
}

export const dustSyncSilentCredit = CREDIT;
