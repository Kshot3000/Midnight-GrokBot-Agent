/**
 * Decode ledger TransactionResult.successfulSegments without trusting the name.
 *
 * Official docs type the field only:
 * https://docs.midnight.network/api-reference/ledger/classes/TransactionResult
 *   successfulSegments?: Map<number, boolean>
 * They do not say what true means.
 *
 * Upstream report (title, still open): true marks the segments that FAILED.
 * https://github.com/midnightntwrk/servicedesk/issues/186
 *
 * Indexer GraphQL uses a different field, transactionResult.segments.success,
 * documented at https://docs.midnight.network/api-reference/midnight-indexer .
 * This helper does not rewrite that field and does not claim the ledger is fixed.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/186';
export const OFFICIAL = 'https://docs.midnight.network/api-reference/ledger/classes/TransactionResult';

export const builderCredit = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function entriesFrom(raw) {
  if (raw == null) return [];
  if (raw instanceof Map) return [...raw.entries()];
  if (Array.isArray(raw)) {
    return raw.map((item, index) => {
      if (Array.isArray(item)) return [item[0], item[1]];
      if (item && typeof item === 'object' && 'id' in item) return [item.id, item.value ?? item.flag];
      return [index, item];
    });
  }
  if (typeof raw === 'object') return Object.entries(raw);
  return [];
}

/**
 * Ledger field polarity reported by servicedesk#186: true means the segment failed.
 * Returns failedSegmentIds using that report. Does not query a node.
 */
export function decodeLedgerSuccessfulSegments(result) {
  const type = result?.type ?? null;
  const segments = entriesFrom(result?.successfulSegments).map(([id, flag]) => {
    const segmentId = Number(id);
    const reportedTrue = flag === true;
    return {
      segmentId,
      rawFlag: flag,
      reportedFailed: reportedTrue,
      nameMeansSuccess: false,
    };
  });
  const failedSegmentIds = segments.filter((row) => row.reportedFailed).map((row) => row.segmentId);
  return {
    type,
    segments,
    failedSegmentIds,
    polarity: 'ledger-successfulSegments-true-means-failed',
    officialDocsDoNotDefinePolarity: true,
    indexerSegmentsSuccessUntouched: true,
    upstream: UPSTREAM,
    official: OFFICIAL,
  };
}

export function checkSegmentPolarity() {
  const failures = [];
  const decoded = decodeLedgerSuccessfulSegments({
    type: 'partialSuccess',
    successfulSegments: new Map([[0, false], [1, true]]),
  });
  if (decoded.failedSegmentIds.length !== 1 || decoded.failedSegmentIds[0] !== 1) {
    failures.push('true must be the failed segment, not the successful one');
  }
  if (decoded.segments.find((row) => row.segmentId === 0)?.reportedFailed !== false) {
    failures.push('false must not be treated as failed under the upstream report');
  }
  if (decoded.indexerSegmentsSuccessUntouched !== true) failures.push('must not rewrite indexer segments.success');
  const objectForm = decodeLedgerSuccessfulSegments({ successfulSegments: { 2: true } });
  if (objectForm.failedSegmentIds[0] !== 2) failures.push('plain object form');
  return { ok: failures.length === 0, failures, upstream: UPSTREAM, official: OFFICIAL, credit: builderCredit };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = checkSegmentPolarity();
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM, credit: builderCredit }, null, 2));
}
