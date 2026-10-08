/**
 * Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkForGenericBounds, checkLabForGenericBound } from '../src/for-generic-bound.mjs';

test('lab sample uses a generic range bound and does not return from for', () => {
  const result = checkLabForGenericBound();
  assert.equal(result.ok, true, result.failures.join('; '));
  assert.deepEqual(result.generics, ['N']);
});

test('rejects a runtime range bound and a return inside for', () => {
  const result = checkForGenericBounds(`
    export circuit bad<#N>(n: Uint<16>): Uint<16> {
      for (const i of 0..n) {
        return i;
      }
    }
  `);
  assert.equal(result.ok, false);
  assert.match(result.failures.join(' '), /not a literal or a declared generic/);
  assert.match(result.failures.join(' '), /return inside for/);
});

test('accepts a declared generic end bound', () => {
  const result = checkForGenericBounds(`
    export circuit ok<#N>(): [] {
      for (const i of 0..N) {
        assert(i < N, "exclusive");
      }
    }
  `);
  assert.equal(result.ok, true, result.failures.join('; '));
});
