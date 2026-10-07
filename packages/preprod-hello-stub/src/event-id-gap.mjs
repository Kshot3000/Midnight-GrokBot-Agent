/**
 * Classify a Preprod indexer event-id sequence the caller already observed.
 * Does not query an indexer and does not fix the public indexer or node.
 *
 * Official networks guide: saved sync state is not portable because event
 * and transaction ids differ between indexers. Discard that state and sync
 * from genesis. Do not shift cursors by hand.
 * https://docs.midnight.network/guides/networks-and-environments
 *
 * Upstream report: official Preprod indexer skips ledger event ids
 * 989781–989802 at block 1130996, so event ids differ from other indexers.
 * https://github.com/midnightntwrk/servicedesk/issues/216
 * Related docs request: https://github.com/midnightntwrk/midnight-docs/issues/1381
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/216';
const DOCS_ISSUE = 'https://github.com/midnightntwrk/midnight-docs/issues/1381';
const DOCS = 'https://docs.midnight.network/guides/networks-and-environments';

/** Inclusive ids named in servicedesk#216. Not re-queried by this lab. */
export const REPORTED_PREPROD_EVENT_SKIP = Object.freeze({
  firstMissing: 989781,
  lastMissing: 989802,
  block: 1130996,
});

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function eventId(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < 0) return null;
  return n;
}

function hostKey(value) {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
}

function coversReportedSkip(gap) {
  const { firstMissing, lastMissing } = REPORTED_PREPROD_EVENT_SKIP;
  return gap.after < firstMissing && gap.before > lastMissing;
}

export function findEventIdGaps(ids) {
  const gaps = [];
  for (let i = 1; i < ids.length; i += 1) {
    const previous = ids[i - 1];
    const current = ids[i];
    if (current === previous) {
      gaps.push({ after: previous, before: current, missing: 0, duplicate: true });
      continue;
    }
    if (current < previous) {
      gaps.push({ after: previous, before: current, missing: null, reversed: true });
      continue;
    }
    if (current > previous + 1) {
      gaps.push({
        after: previous,
        before: current,
        missing: current - previous - 1,
        duplicate: false,
        reversed: false,
      });
    }
  }
  return gaps;
}

export function classifyEventIdSequence(input = {}) {
  const raw = Array.isArray(input.eventIds) ? input.eventIds : [];
  const ids = raw.map(eventId);
  if (ids.length < 2 || ids.some((id) => id == null)) {
    return {
      ok: false,
      classification: 'incomplete',
      title: 'Event-id probe incomplete',
      hint: 'Need at least two numeric event ids the caller already observed. This helper does not call the indexer and does not shift cursors.',
      gaps: [],
      upstream: UPSTREAM,
      docsIssue: DOCS_ISSUE,
      docs: DOCS,
      reportedSkip: REPORTED_PREPROD_EVENT_SKIP,
    };
  }

  const gaps = findEventIdGaps(ids);
  const savedFrom = hostKey(input.savedFromHost);
  const resumeOn = hostKey(input.resumeHost ?? input.indexerHost);
  const crossIndexer = Boolean(savedFrom && resumeOn && savedFrom !== resumeOn);
  const resumeIndex = eventId(input.resumeIndex);
  const insideReported =
    resumeIndex != null &&
    resumeIndex >= REPORTED_PREPROD_EVENT_SKIP.firstMissing &&
    resumeIndex <= REPORTED_PREPROD_EVENT_SKIP.lastMissing;
  const reportedGap = gaps.find((gap) => !gap.reversed && !gap.duplicate && coversReportedSkip(gap));

  let classification = 'contiguous';
  let title = 'Observed event ids are contiguous';
  let hint =
    'These observed ids have no gap. A stall can still be non-portable saved state if the wallet resumes on a different indexer. Official guidance: discard that state and sync from genesis. Do not shift cursors by hand.';

  if (gaps.some((gap) => gap.reversed)) {
    classification = 'reversed-event-ids';
    title = 'Event ids went backwards';
    hint =
      'Observed event ids are not monotonic. Do not shift a saved cursor to paper over this. Discard the saved sync state and sync from genesis. This lab does not fix the public indexer or node.';
  } else if (gaps.some((gap) => gap.duplicate)) {
    classification = 'duplicate-event-ids';
    title = 'Event ids repeated';
    hint =
      'A repeated event id is not a cursor to increment by hand. Discard saved sync state that was recorded against another indexer and sync from genesis.';
  } else if (reportedGap) {
    classification = 'reported-preprod-skip';
    title = 'Gap matches the reported Preprod event-id skip';
    hint = `Observed ids jump across 989781–989802 (servicedesk#216, block 1130996, ${reportedGap.missing} missing between ${reportedGap.after} and ${reportedGap.before}). Event ids are not portable across indexers. Discard saved state and sync from genesis. Do not shift cursors by hand. Not a public indexer or node fix.`;
  } else if (gaps.length > 0) {
    classification = 'event-id-gap';
    title = 'Observed event ids have a gap';
    hint = `Observed ids skip ${gaps.map((gap) => `${gap.missing} between ${gap.after} and ${gap.before}`).join('; ')}. Treat saved event ids as indexer-local. Discard and sync from genesis rather than shifting the cursor. Not a public indexer or node fix.`;
  } else if (crossIndexer || insideReported) {
    classification = 'non-portable-resume';
    title = 'Saved event cursor is not portable onto this indexer';
    hint = insideReported
      ? `Resume index ${resumeIndex} sits inside the reported skip 989781–989802. Do not shift that cursor. Discard saved state and sync from genesis.`
      : `Saved state from ${savedFrom} is being resumed on ${resumeOn}. Official networks guide: event and transaction ids differ between indexers. Discard that state and sync from genesis. Do not shift cursors by hand.`;
  }

  return {
    ok: classification === 'contiguous' && !crossIndexer && !insideReported,
    classification,
    gaps,
    crossIndexer,
    insideReported,
    title,
    hint,
    upstream: UPSTREAM,
    docsIssue: DOCS_ISSUE,
    docs: DOCS,
    reportedSkip: REPORTED_PREPROD_EVENT_SKIP,
  };
}


/**
 * Name the dust-tree insert error the official networks guide already lists
 * for a non-portable indexer cursor. Does not query an indexer.
 * Official row: "values inserted non-linearly into dust generation tree".
 * Upstream numbers: servicedesk#216 (official Preprod skip 989781-989802).
 * @param {unknown} error
 */
export function decodeDustTreeInsert(error) {
  const blob = error == null
    ? ''
    : typeof error === 'string'
      ? error
      : [error.message, error.cause && error.cause.message].filter(Boolean).join(' ');
  const match = blob.match(/values inserted non-linearly into (dust generation tree|zswap commitment tree|dust commitment tree); expected to insert index (\d+), but received (\d+)/);
  if (!match) {
    return {
      ok: true,
      classification: 'not-dust-tree-insert',
      title: 'Error is not the documented non-linear tree insert',
      hint: 'This helper only names the string on the official networks page. It does not call an indexer or node.',
      upstream: UPSTREAM,
      docs: DOCS,
      credit: CREDIT,
    };
  }
  const tree = match[1];
  const expected = Number(match[2]);
  const received = Number(match[3]);
  return {
    ok: false,
    classification: 'non-portable-dust-cursor',
    tree,
    expected,
    received,
    title: 'Saved sync cursor is not portable onto this indexer',
    hint: `Official networks guide: "${tree}" expected index ${expected} but received ${received} when saved sync state resumes on another indexer. servicedesk#216 reports official Preprod event ids 989781-989802 missing at block 1130996, so later ids differ by 22 from another indexer of the same chain. Discard that state and sync from genesis. Do not shift cursors by hand. Not a public indexer or node fix.`,
    upstream: UPSTREAM,
    docs: DOCS,
    reportedSkip: REPORTED_PREPROD_EVENT_SKIP,
    credit: CREDIT,
  };
}

export const eventIdGapCredit = CREDIT;
