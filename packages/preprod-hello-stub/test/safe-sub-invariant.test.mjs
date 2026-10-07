/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkLabSafeSub, checkSafeSub } from '../src/safe-sub-invariant.mjs';

test('lab safe-sub matches the official bound-then-subtract pattern', () => {
  const result = checkLabSafeSub();
  assert.equal(result.ok, true, result.failures.join('; '));
  assert.equal(result.abortText, 'result of subtraction would be negative');
});

test('rejects a source that wraps instead of asserting', () => {
  const result = checkSafeSub('balance = balance - amount % 1; wrapping');
  assert.equal(result.ok, false);
});
