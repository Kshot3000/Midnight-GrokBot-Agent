/**
 * Transfer-bounds Compact invariant. Does not invoke compactc.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1487
 *
 * Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { checkTransferBounds } from '../src/transfer-bounds-invariant.mjs';

const STALE = `
const MAX_AMOUNT: Uint<64> = 1000000;
const MIN_AMOUNT: Uint<64> = 1;

ledger balance: Uint<64>;

export circuit transfer(recipient: Bytes<32>, amount: Uint<64>): [] {
  assert(amount >= MIN_AMOUNT, "Amount too small");
  assert(amount <= MAX_AMOUNT, "Amount exceeds maximum");
  assert(balance >= amount, "Insufficient funds");
  assert(recipient != Bytes<32>{}, "Invalid recipient");
  balance = balance - amount;
}
`;

describe('transfer bounds (midnight-docs#1487)', () => {
  it('flags the published Test and debug Compact sample', () => {
    const report = checkTransferBounds(STALE);
    assert.equal(report.ok, false);
    const text = report.failures.join(' ');
    assert.match(text, /top-level const/);
    assert.match(text, /Bytes<N>\{\}/);
    assert.match(text, /disclose/);
  });

  it('accepts the lab contract that keeps bounds inside the circuit', () => {
    const source = readFileSync(
      new URL('../../../contracts/hello-midnight/transfer-bounds.compact', import.meta.url),
      'utf8',
    );
    const report = checkTransferBounds(source);
    assert.equal(report.ok, true, report.failures.join('; '));
    assert.equal(report.compiler, '0.31.1');
    assert.equal(report.language, '>= 0.23');
    assert.match(report.credit, /kshot9000@gmail.com/);
    assert.match(report.upstream, /midnight-docs\/issues\/1487/);
  });
});
