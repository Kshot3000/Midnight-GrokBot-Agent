/**
 * Wallet builder InitialAPI gap.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1554
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { checkWalletBuilderInitialApi } from '../src/wallet-builder-gap.mjs';

describe('wallet builder InitialAPI gap (midnight-docs#1554)', () => {
  it('accepts a plan that matches the published connector page and the specification', () => {
    const result = checkWalletBuilderInitialApi({
      fields: ['rdns', 'name', 'icon', 'apiVersion', 'connect'],
      apiVersion: '4.0.1',
      installsUnderWindowMidnight: true,
      keyIsUuid: true,
    });
    assert.equal(result.ok, true);
    assert.deepEqual(result.failures, []);
    assert.match(result.upstream, /1554/);
  });

  it('rejects a plan that omits rdns and the published fields', () => {
    const result = checkWalletBuilderInitialApi({
      fields: ['name'],
      installsUnderWindowMidnight: false,
    });
    assert.equal(result.ok, false);
    assert.ok(result.failures.length > 0);
    assert.ok(result.failures.some((f) => f.includes('rdns')));
    assert.ok(result.failures.some((f) => f.includes('connect')));
  });
});
