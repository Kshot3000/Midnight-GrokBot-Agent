/**
 * Assert private implicit pin.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1487
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { checkAssertPrivateImplicitPin } from '../src/assert-private-implicit-pin.mjs';

describe('assert private implicit pin (midnight-docs#1487)', () => {
  it('accepts assert on privateAge without disclose on the condition', () => {
    const report = checkAssertPrivateImplicitPin();
    assert.equal(report.ok, true);
    assert.equal(report.hasAssert, true);
    assert.equal(report.hasDiscloseOnWrite, true);
    assert.equal(report.noDiscloseOnAssert, true);
  });
});
