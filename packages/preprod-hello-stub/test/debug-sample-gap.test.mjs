/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { scanDebugSample } from '../src/debug-sample-gap.mjs';

test('lab bounds circuit has pragma and disclose', () => {
  const source = readFileSync(new URL('../../../contracts/hello-midnight/debug-sample-disclose.compact', import.meta.url), 'utf8');
  const result = scanDebugSample(source);
  assert.equal(result.ok, true, result.failures.join('; '));
});

test('published transfer sample is missing pragma and disclose', () => {
  const published = `
const MAX_AMOUNT: Uint<64> = 1000000;
export ledger balance: Uint<64>;
export circuit transfer(recipient: Bytes<32>, amount: Uint<64>): [] {
  assert(amount <= MAX_AMOUNT, "Amount exceeds maximum");
  balance = balance - amount;
}
`;
  const result = scanDebugSample(published);
  assert.equal(result.ok, false);
  assert.equal(result.failures.length, 2);
});

test('jest circuit harness is not createCircuitContext', () => {
  const published = `
import { describe, it, expect } from '@jest/globals';
const result = contract.impureCircuits.increment({ privateState, ledgerState: { round: 0n } });
expect(result.newLedgerState.round).toBe(1n);
`;
  const result = scanDebugSample(published);
  assert.equal(result.ok, false);
  assert.match(result.failures[0], /createCircuitContext/);
});
