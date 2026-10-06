import { describe, it, expect } from 'vitest';
import { checkBrowserLifecycle } from '../src/browser-lifecycle.mjs';

/**
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1379
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const slots = [
  'privateStateProvider',
  'publicDataProvider',
  'zkConfigProvider',
  'proofProvider',
  'walletProvider',
  'midnightProvider',
];

describe('browser lifecycle pin for midnight-docs#1379', () => {
  it('accepts a connected 4.0.1 plan with the six provider slots', () => {
    const result = checkBrowserLifecycle({
      apiVersion: '4.0.1',
      networkId: 'preprod',
      connected: true,
      connectionNetworkId: 'preprod',
      setNetworkIdBeforeProviders: true,
      providerSlots: slots,
      hasGetProvingProvider: false,
      proofServerUrl: 'http://localhost:6300',
    });
    expect(result.ok).toBe(true);
    expect(result.upstream).toContain('1379');
  });

  it('rejects a skipped connect and a 1.x apiVersion filter', () => {
    const result = checkBrowserLifecycle({
      apiVersion: '1.0.0',
      networkId: 'preprod',
      connected: false,
      setNetworkIdBeforeProviders: false,
      providerSlots: [],
      usesOnlyDeprecatedProverServerUri: true,
    });
    expect(result.ok).toBe(false);
    expect(result.failures.join(' ')).toMatch(/connect/);
    expect(result.failures.join(' ')).toMatch(/4\.0\.1/);
  });
});
