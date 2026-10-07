import assert from 'node:assert/strict';
import test from 'node:test';
import { classifyBalanceObservation, withBalanceDeadline, DustBalanceStallError } from '../src/dust-balance-stall.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

test('a zero-coin deadline is a stall, not a named funds error', () => {
  const result = classifyBalanceObservation({
    elapsedMs: 30000,
    deadlineMs: 30000,
    selectedCoins: 0,
    rssGrowthBytes: 300 * 1024 * 1024,
  });
  assert.equal(result.stalled, true);
  assert.equal(result.sdkFixedHere, false);
  assert.match(result.upstream, /servicedesk\/issues\/194/);
  assert.match(result.reasons.join(' '), /zero coins/);
});

test('InsufficientFundsError is not classified as the silent loop', () => {
  const result = classifyBalanceObservation({
    elapsedMs: 40,
    deadlineMs: 30000,
    errorMessage: 'InsufficientFundsError: dust pool cannot cover fee',
    selectedCoins: 2,
  });
  assert.equal(result.stalled, false);
  assert.match(result.reasons.join(' '), /InsufficientFundsError/);
});

test('withBalanceDeadline rejects a hung balance without waiting on the SDK', async () => {
  const err = await withBalanceDeadline(() => new Promise(() => {}), 25, {
    setTimer: (fn) => {
      queueMicrotask(fn);
      return 1;
    },
    clearTimer: () => {},
  }).then(() => null, (caught) => caught);
  assert.equal(err instanceof DustBalanceStallError, true);
  assert.match(err.message, /servicedesk#194/);
  assert.equal(err.details.sdkFixedHere, false);
});

test('withBalanceDeadline returns a settled recipe', async () => {
  const value = await withBalanceDeadline(() => Promise.resolve({ recipe: 'ok' }), 50);
  assert.deepEqual(value, { recipe: 'ok' });
});
