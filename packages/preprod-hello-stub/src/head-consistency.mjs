/**
 * Decode successive Substrate chain_getHeader numbers and flag a backwards head.
 *
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/223
 * Public Preprod RPC https://rpc.preprod.midnight.network (docs:
 * https://docs.midnight.network/guides/networks-and-environments) can return a
 * lower block number on a later HTTP 200. This module only compares numbers
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

/**
 * @param {unknown} header chain_getHeader result object, or a raw number/hex string
 * @returns {number | null}
 */
export function parseHeaderNumber(header) {
  if (header == null) return null;
  if (typeof header === 'number' && Number.isFinite(header)) return Math.trunc(header);
  if (typeof header === 'string') return parseBlockToken(header);
  if (typeof header !== 'object') return null;
  const record = /** @type {Record<string, unknown>} */ (header);
  const token = record.number ?? record.blockNumber ?? record.head;
  if (typeof token === 'number' && Number.isFinite(token)) return Math.trunc(token);
  if (typeof token === 'string') return parseBlockToken(token);
  return null;
}

function parseBlockToken(token) {
  const trimmed = token.trim();
  if (!trimmed) return null;
  if (/^0x[0-9a-f]+$/i.test(trimmed)) return Number.parseInt(trimmed, 16);
  if (/^\d+$/.test(trimmed)) return Number.parseInt(trimmed, 10);
  return null;
}

/**
 * @param {Array<{ height: number | null, ok?: boolean, ms?: number }>} samples
 */
export function summarizeHeadSamples(samples) {
  const rows = samples.map((sample, index) => ({
    index,
    height: sample.height == null ? null : sample.height,
    ok: sample.ok !== false && sample.height != null,
    ms: sample.ms ?? null,
    delta: null,
    backwards: false,
  }));
  let previous = null;
  let backwards = 0;
  let largestStepBack = 0;
  for (const row of rows) {
    if (!row.ok) continue;
    if (previous != null) {
      row.delta = row.height - previous;
      if (row.delta < 0) {
        row.backwards = true;
        backwards += 1;
        largestStepBack = Math.max(largestStepBack, -row.delta);
      }
    }
    previous = row.height;
  }
  const heights = rows.filter((row) => row.ok).map((row) => row.height);
  return {
    upstream: UPSTREAM_ISSUE,
    samples: rows.length,
    ok: heights.length,
    failed: rows.length - heights.length,
    backwards,
    largestStepBack,
    min: heights.length ? Math.min(...heights) : null,
    max: heights.length ? Math.max(...heights) : null,
    monotonic: backwards === 0 && heights.length >= 2,
    rows,
    note: 'A backwards head is a client observation of the public RPC, not a local node fix.',
  };
}
