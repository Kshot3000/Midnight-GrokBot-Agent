/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { classifyFallibleCheckpoint, ERROR_CODE } from '../src/fallible-checkpoint.mjs';

const sample = readFileSync(new URL('../../../contracts/hello-midnight/fallible-checkpoint.compact', import.meta.url), 'utf8');

test('checkpoint comes before a later kernel read', () => {
  const result = classifyFallibleCheckpoint(sample);
  assert.equal(result.ok, true, result.failures.join('; '));
  assert.ok(result.checked.includes('markFallible'));
  assert.equal(result.errorCode, ERROR_CODE);
});

test('rejects a fallible section with no checkpoint', () => {
  const result = classifyFallibleCheckpoint('// fallible section\nexport circuit late(): [] { kernel.blockTimeGreaterThan(0); }');
  assert.equal(result.ok, false);
  assert.match(result.failures[0], /118/);
});

test('rejects a kernel call before checkpoint', () => {
  const result = classifyFallibleCheckpoint('// fallible section\nexport circuit swapped(): [] { kernel.self(); kernel.checkpoint(); }');
  assert.equal(result.ok, false);
  assert.match(result.failures[0], /not the first kernel call/);
});
