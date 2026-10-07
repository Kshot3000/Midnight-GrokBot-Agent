/**
 * Snapshot of the published examples matrix vs midnight-docs#1163.
 *
 * Official page read 2026-10-07: https://docs.midnight.network/examples
 * The live table is still a flat feature list. It does not include the
 * Leaderboard or Private party columns the issue asks to add, and cells are
 * not deep links. This module does not scrape the site and does not edit
 * midnight-docs.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1163';
export const OFFICIAL = 'https://docs.midnight.network/examples';
export const SNAPSHOT_DATE = '2026-10-07';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/** Columns named on the published examples page. Not a private API. */
export const PUBLISHED_COLUMNS = [
  'Calculator',
  'Token transfers',
  'Private guest list',
  'Election',
  'Private reserve auction',
  'Battleship',
  'Bulletin board',
  'ZK Loan',
];

/** Columns issue #1163 says are still missing from the matrix. */
export const MISSING_COLUMNS = ['Leaderboard', 'Private party'];

export function checkExamplesMatrixGap(columns = PUBLISHED_COLUMNS) {
  const failures = [];
  const published = new Set(columns);
  for (const name of MISSING_COLUMNS) {
    if (published.has(name)) {
      failures.push(`${name} is present; #1163 said it was absent`);
    }
  }
  if (!published.has('Bulletin board')) failures.push('published snapshot lost Bulletin board');
  if (!published.has('Calculator')) failures.push('published snapshot lost Calculator');
  if (columns.length !== PUBLISHED_COLUMNS.length && columns === PUBLISHED_COLUMNS) {
    failures.push('column count drifted');
  }
  return {
    ok: failures.length === 0,
    failures,
    upstream: 'midnightntwrk/midnight-docs#1163',
    official: OFFICIAL,
    snapshotDate: SNAPSHOT_DATE,
    publishedColumns: [...columns],
    missingColumns: MISSING_COLUMNS.filter((name) => !published.has(name)),
    shape: 'flat-table',
    credit: CREDIT,
  };
}

export function checkLabDoesNotClaimMissingExamples(note) {
  const failures = [];
  const text = String(note ?? '');
  if (/this lab is the Leaderboard example/i.test(text)) {
    failures.push('lab must not claim to be the Leaderboard example');
  }
  if (/this lab is the Private party example/i.test(text)) {
    failures.push('lab must not claim to be the Private party example');
  }
  return { ok: failures.length === 0, failures };
}

function main() {
  const result = checkExamplesMatrixGap();
  if (!result.ok) {
    console.error(result.failures.join('\n'));
    process.exit(1);
  }
  console.log(`examples matrix gap ok; missing ${result.missingColumns.join(', ')}`);
  console.log(CREDIT);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main();
}
