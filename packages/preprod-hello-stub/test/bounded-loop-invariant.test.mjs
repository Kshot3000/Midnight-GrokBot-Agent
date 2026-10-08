/**
 * Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkBoundedLoops, checkLabBoundedLoop } from '../src/bounded-loop-invariant.mjs';

test('lab bounded-loop uses both documented for forms', () => {
  const result = checkLabBoundedLoop();
  assert.equal(result.ok, true, result.failures.join('; '));
  assert.equal(result.forCount, 2);
});

test('rejects an inverted literal range and a while loop', () => {
  const result = checkBoundedLoops(`
    export circuit spin(): [] {
      for (const i of 4..1) {
        assert(i < 4, "bad");
      }
      while (true) {}
    }
  `);
  assert.equal(result.ok, false);
  assert.match(result.failures.join(' '), /end < start/);
  assert.match(result.failures.join(' '), /while/);
});

test('rejects a circuit that calls itself', () => {
  const result = checkBoundedLoops(`
    export circuit walk(): [] {
      for (const i of 0..1) {
        walk();
      }
    }
  `);
  assert.equal(result.ok, false);
  assert.match(result.failures.join(' '), /disallows recursion/);
});
