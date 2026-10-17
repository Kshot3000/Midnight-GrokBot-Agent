import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyFaucetAmount } from '../src/faucet-amount-unit.mjs';

test('amount 1000 classifies as 5000 tNIGHT', () => {
  const r = classifyFaucetAmount('1000');
  assert.equal(r.kind, 'multiplied-unit');
  assert.equal(r.expectedTnight, '5000');
  assert.equal(r.expectedStar, '5000000000');
  assert.match(r.upstream, /254/);
});

test('rejects non-numeric amount', () => {
  const r = classifyFaucetAmount('abc');
  assert.equal(r.kind, 'invalid-amount');
});
