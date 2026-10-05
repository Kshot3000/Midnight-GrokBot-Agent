/**
 * Interpret ledger TransactionResult.successfulSegments without treating
 * the boolean as "applied".
 *
 * Official field: Map<number, boolean> on TransactionResult
 * https://docs.midnight.network/api-reference/ledger/classes/TransactionResult
 * Present only for type "partialSuccess". Undefined on success and failure.
 *
 * Upstream midnightntwrk/servicedesk#186 measured ledger-v9 1.0.0-rc.3
 * (and the same is_err() write in an 8.2.0-rc.1 source): the map value is
 * the failure flag, so true marks a segment that FAILED and false marks a
 * segment that APPLIED. This helper does not change the public ledger.
 *
 * Indexer GraphQL Segment.success is a different field
 * (https://docs.midnight.network/api-reference/midnight-indexer/types/objects/segment).
 * This module does not claim that GraphQL boolean is inverted.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

export const UPSTREAM_SEGMENT_POLARITY = 'https://github.com/midnightntwrk/servicedesk/issues/186';

function entriesOf(successfulSegments) {
  if (successfulSegments == null) return [];
  if (successfulSegments instanceof Map) return [...successfulSegments.entries()];
  if (Array.isArray(successfulSegments)) return successfulSegments;
  if (typeof successfulSegments === 'object') return Object.entries(successfulSegments);
  return [];
}

export function interpretSuccessfulSegments(result) {
  const type = result?.type ?? result?.status ?? null;
  const raw = entriesOf(result?.successfulSegments ?? result?.segments);
  const segments = raw
    .map(([id, flag]) => {
      const segmentId = Number(id);
      const reported = flag === true || flag === 'true';
      return {
        segmentId,
        reported,
        applied: type === 'partialSuccess' ? !reported : null,
        failed: type === 'partialSuccess' ? reported : null,
      };
    })
    .filter((row) => Number.isFinite(row.segmentId));

  if (type !== 'partialSuccess' && type !== 'PARTIAL_SUCCESS') {
    return {
      ok: type === 'success' || type === 'SUCCESS',
      polarity: 'absent',
      title: 'successfulSegments is not on this result',
      hint: 'Official TransactionResult only carries successfulSegments for partialSuccess. success and failure leave it undefined. Do not invent a per-segment map.',
      upstream: UPSTREAM_SEGMENT_POLARITY,
      segments,
    };
  }

  return {
    ok: segments.some((row) => row.applied),
    polarity: 'inverted-on-partialSuccess',
    title: 'partialSuccess map is inverted versus its name',
    hint: 'On partialSuccess, a true entry means that segment failed and a false entry means it applied (servicedesk#186, ledger wasm is_err()). Confirm against ledger state. This lab does not patch the node.',
    upstream: UPSTREAM_SEGMENT_POLARITY,
    segments,
  };
}

export const builderCredit = CREDIT;
