/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MISSING_COLUMNS,
  PUBLISHED_COLUMNS,
  checkExamplesMatrixGap,
  checkLabDoesNotClaimMissingExamples,
} from '../src/examples-matrix-gap.mjs';

test('published examples matrix still omits Leaderboard and Private party', () => {
  const result = checkExamplesMatrixGap();
  assert.equal(result.ok, true, result.failures.join('; '));
  assert.equal(result.upstream, 'midnightntwrk/midnight-docs#1163');
  assert.deepEqual(result.missingColumns, MISSING_COLUMNS);
  assert.equal(result.shape, 'flat-table');
  assert.equal(PUBLISHED_COLUMNS.includes('Leaderboard'), false);
});

test('a future matrix that adds the missing columns fails this snapshot', () => {
  const result = checkExamplesMatrixGap([...PUBLISHED_COLUMNS, 'Leaderboard']);
  assert.equal(result.ok, false);
  assert.ok(result.failures.some((item) => item.includes('Leaderboard')));
});

test('lab note must not claim the missing example columns', () => {
  const bad = checkLabDoesNotClaimMissingExamples('this lab is the Leaderboard example');
  assert.equal(bad.ok, false);
  const ok = checkLabDoesNotClaimMissingExamples('hello counter is not Private party');
  assert.equal(ok.ok, true);
});
