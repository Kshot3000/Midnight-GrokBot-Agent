/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { checkUintWidth, MAX_UINT_BITS } from '../src/uint-width-invariant.mjs';

test('Uint<64> lab contract is inside the documented bound', () => {
  const source = readFileSync(new URL('../../../contracts/hello-midnight/uint-width.compact', import.meta.url), 'utf8');
  const result = checkUintWidth(source);
  assert.equal(result.ok, true, result.failures.join('; '));
  assert.equal(MAX_UINT_BITS, 248);
});

test('Uint<256> is the proof-server width gap', () => {
  const result = checkUintWidth('export ledger wide: Uint<256>;');
  assert.equal(result.ok, false);
  assert.match(result.failures[0], /Uint<256>/);
});
