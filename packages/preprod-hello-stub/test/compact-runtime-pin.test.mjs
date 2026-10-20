// Built by @kshot9000 https://x.com/kshot9000
// Email: kshot9000@gmail.com
// Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
// Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  NETWORK_RUNTIME,
  PUBLISHED_API_RUNTIME,
  COMPATIBLE_TOOLCHAIN,
  isPublishedApiMismatch,
  assertNetworkRuntime,
} from '../src/compact-runtime-pin.mjs';

test('matrix pin is 0.16.0, published API is 0.20.0', () => {
  assert.equal(NETWORK_RUNTIME, '0.16.0');
  assert.equal(PUBLISHED_API_RUNTIME, '0.20.0');
  assert.equal(COMPATIBLE_TOOLCHAIN, '0.31.1');
  assert.equal(isPublishedApiMismatch(), true);
});

test('assertNetworkRuntime accepts only the matrix pin', () => {
  assert.equal(assertNetworkRuntime('0.16.0'), true);
  assert.throws(() => assertNetworkRuntime('0.20.0'), /midnight-docs#1564/);
});
