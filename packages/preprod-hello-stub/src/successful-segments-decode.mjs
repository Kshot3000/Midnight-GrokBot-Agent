/**
 * Decoder for the known inversion of TransactionResult.successfulSegments.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/186
 * Official: https://docs.midnight.network/api-reference/ledger/classes/TransactionResult
 *
 * On ledger 9 the map stores is_err() so true means FAILED, false means APPLIED.
 * This classifier does not contact any node or invent APIs. It only labels a
 * partialSuccess map so a builder does not treat the boolean as success.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

/**
 * @param {{ type?: string, successfulSegments?: Map<number, boolean> | Record<number, boolean> }} result
 * @returns {{ kind: string, warning?: string, inverted?: boolean, upstream?: string }}
 */
export function classifySuccessfulSegments(result) {
  if (!result || result.type !== 'partialSuccess') {
    return { kind: 'not-partial', reason: 'successfulSegments exists only on partialSuccess' };
  }
  const map = result.successfulSegments;
  if (!map) {
    return { kind: 'missing-map', reason: 'partialSuccess but no successfulSegments' };
  }
  const entries = map instanceof Map ? [...map.entries()] : Object.entries(map).map(([k, v]) => [Number(k), v]);
  // Flag the known structural inversion reported on ledger 9.
  return {
    kind: 'partial-success-map',
    warning: 'On ledger 9 (servicedesk#186) successfulSegments stores is_err(); true means the segment FAILED',
    inverted: true,
    upstream: 'midnightntwrk/servicedesk#186',
    entries,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const sample = {
    type: 'partialSuccess',
    successfulSegments: new Map([[2518, false], [24305, true], [29863, false]]),
  };
  const out = classifySuccessfulSegments(sample);
  console.log(JSON.stringify(out, null, 2));
  if (out.kind !== 'partial-success-map' || !out.inverted) process.exit(1);
  console.log('self-check ok');
}
