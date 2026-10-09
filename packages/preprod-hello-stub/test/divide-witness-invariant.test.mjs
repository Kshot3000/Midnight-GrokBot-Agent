/**
 * Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkLabDivideWitness, checkDivideWitness } from '../src/divide-witness-invariant.mjs';

test('lab divide witness matches the calculator assert', () => {
  const result = checkLabDivideWitness();
  assert.equal(result.ok, true, result.failures.join('; '));
  assert.equal(result.assertMessage, 'incorrect division');
});

test('rejects an unconstrained witness quotient', () => {
  const result = checkDivideWitness('pragma language_version 0.23; witness divMod(num1: Uint<16>, num2: Uint<16>): [Uint<16>, Uint<16>];');
  assert.equal(result.ok, false);
});
