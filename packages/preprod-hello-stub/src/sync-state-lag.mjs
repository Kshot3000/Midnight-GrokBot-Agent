/**
 * Decode successive system_syncState samples and flag a false-synced lower head.
 *
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/223
 * On public Preprod RPC https://rpc.preprod.midnight.network (listed at
 * https://docs.midnight.network/guides/networks-and-environments) a later
 * system_syncState can report currentBlock == highestBlock several blocks
 * below a highestBlock already returned. This module only compares numbers
 * the caller already collected. It does not fix the public node or indexer.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_ISSUE = 'https://github.com/midnightntwrk/servicedesk/issues/223';

export const builderCredit = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function parseBlockToken(token) {
  if (typeof token === 'number' && Number.isFinite(token)) return Math.trunc(token);
  if (typeof token !== 'string') return null;
  const trimmed = token.trim();
  if (!trimmed) return null;
  if (/^0x[0-9a-f]+$/i.test(trimmed)) return Number.parseInt(trimmed, 16);
  if (/^\d+$/.test(trimmed)) return Number.parseInt(trimmed, 10);
  return null;
}

/**
 * @param {unknown} sample system_syncState result, or { currentBlock, highestBlock }
 * @returns {{ currentBlock: number | null, highestBlock: number | null }}
 */
export function parseSyncState(sample) {
  if (sample == null || typeof sample !== 'object') {
    return { currentBlock: null, highestBlock: null };
  }
  const record = /** @type {Record<string, unknown>} */ (sample);
  const nested = record.result && typeof record.result === 'object'
    ? /** @type {Record<string, unknown>} */ (record.result)
    : record;
  return {
    currentBlock: parseBlockToken(nested.currentBlock),
    highestBlock: parseBlockToken(nested.highestBlock),
  };
}

/**
 * @param {Array<unknown>} samples
 */
export function summarizeSyncStateSamples(samples) {
  let seenHighest = null;
  let falseSynced = 0;
  let largestLag = 0;
  const rows = samples.map((sample, index) => {
    const parsed = parseSyncState(sample);
    const reportsSynced = parsed.currentBlock != null
      && parsed.highestBlock != null
      && parsed.currentBlock === parsed.highestBlock;
    const lag = reportsSynced && seenHighest != null && parsed.highestBlock < seenHighest
      ? seenHighest - parsed.highestBlock
      : 0;
    const falseSyncedBelowPrior = lag > 0;
    if (falseSyncedBelowPrior) {
      falseSynced += 1;
      largestLag = Math.max(largestLag, lag);
    }
    if (parsed.highestBlock != null) {
      seenHighest = seenHighest == null ? parsed.highestBlock : Math.max(seenHighest, parsed.highestBlock);
    }
    return {
      index,
      currentBlock: parsed.currentBlock,
      highestBlock: parsed.highestBlock,
      reportsSynced,
      falseSyncedBelowPrior,
      lag,
    };
  });
  return {
    upstream: UPSTREAM_ISSUE,
    samples: rows.length,
    falseSynced,
    largestLag,
    seenHighest,
    rows,
    note: 'A false-synced lower head is a client observation of the public RPC, not a local node fix.',
  };
}
