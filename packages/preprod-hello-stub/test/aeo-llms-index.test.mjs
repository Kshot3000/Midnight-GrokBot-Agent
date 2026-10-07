/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkAeoLlmsIndex, checkLabAeoLlmsIndex } from '../src/aeo-llms-index.mjs';

test('lab llms map is a link index, not prose with zero links', () => {
  const result = checkLabAeoLlmsIndex();
  assert.equal(result.ok, true, result.failures.join('; '));
  assert.equal(result.upstream, 'midnightntwrk/midnight-docs#1386');
  assert.ok(result.linkCount >= 5);
});

test('rejects the prose-only failure mode named in midnight-docs#1386', () => {
  const result = checkAeoLlmsIndex(`
    Midnight is a data-protection platform.
    This file explains the network and has no links.
  `);
  assert.equal(result.ok, false);
  assert.equal(result.linkCount, 0);
  assert.ok(result.failures.some((item) => item.includes('zero markdown links')));
});
