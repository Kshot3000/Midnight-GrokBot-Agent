/**
 * Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkLabSafeAdd, checkSafeAdd } from '../src/safe-add-invariant.mjs';

test('lab safe-add matches the official bound-then-cast pattern', () => {
  const result = checkLabSafeAdd();
  assert.equal(result.ok, true, result.failures.join('; '));
  assert.equal(result.castForm, '(balance + amt) as Uint<64>');
});

test('rejects a same-width store of the widened sum', () => {
  const result = checkSafeAdd('balance = balance + amt; wrapping');
  assert.equal(result.ok, false);
});
