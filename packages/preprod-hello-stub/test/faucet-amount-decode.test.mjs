/**
 * Faucet amount unit decoder.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/254
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { decodeFaucetAmount } from '../src/faucet-amount-decode.mjs';

describe('faucet amount decode (servicedesk#254)', () => {
  it('flags the reported amount 1000 as delivering 5000', () => {
    const report = decodeFaucetAmount('{"amount": "1000"}');
    assert.equal(report.ok, true);
    assert.equal(report.classification, 'reported-1000-becomes-5000');
    assert.equal(report.requested, 1000);
    assert.equal(report.deliveredIfMultiplied, 5000);
    assert.match(report.hint, /does not fix the public faucet/);
    assert.match(report.credit, /kshot9000@gmail.com/);
  });

  it('classifies a plain numeric amount', () => {
    const report = decodeFaucetAmount('200');
    assert.equal(report.ok, true);
    assert.equal(report.classification, 'amount-times-five');
    assert.equal(report.deliveredIfMultiplied, 1000);
  });

  it('rejects incomplete input', () => {
    const report = decodeFaucetAmount('');
    assert.equal(report.ok, false);
    assert.equal(report.classification, 'incomplete');
  });
});
