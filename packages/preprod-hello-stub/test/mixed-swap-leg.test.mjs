import { describe, expect, it } from 'vitest';
import { classifyMixedSwap, OFFICIAL_SWAP_GUIDE, UPSTREAM_MIXED_SWAP } from '../src/mixed-swap-leg.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

describe('mixed initSwap leg', () => {
  it('flags a shielded input whose unshielded want is missing from intents', () => {
    const result = classifyMixedSwap(
      {
        inputs: { shielded: { token: 1n } },
        outputs: [{ type: 'unshielded', outputs: [{ amount: 1n }] }],
      },
      { intents: {}, guaranteedOffer: { inputs: [{}], outputs: [] } },
    );
    expect(result.classification).toBe('one-legged-initSwap');
    expect(result.oneLegged).toBe(true);
    expect(result.treatAsCompleteOffer).toBe(false);
    expect(result.fixesWallet).toBe(false);
    expect(result.upstream).toBe(UPSTREAM_MIXED_SWAP);
    expect(result.official).toBe(OFFICIAL_SWAP_GUIDE);
    expect(result.hint).toMatch(/does not fix the wallet/i);
  });

  it('flags an unshielded input whose shielded want has no guaranteed offer', () => {
    const result = classifyMixedSwap(
      {
        inputs: { unshielded: { night: 1n } },
        outputs: [{ type: 'shielded', outputs: [{ amount: 1n }] }],
      },
      { intents: { 1: { guaranteedUnshieldedOffer: {} } }, guaranteedOffer: undefined },
    );
    expect(result.classification).toBe('one-legged-initSwap');
    expect(result.ok).toBe(false);
  });

  it('does not reject the official same-kind shielded example shape', () => {
    const result = classifyMixedSwap({
      inputs: { shielded: { token1: 1_000_000n } },
      outputs: [{ type: 'shielded', outputs: [{ amount: 1_000_000n }] }],
    });
    expect(result.classification).toBe('same-kind-offer');
    expect(result.mixed).toBe(false);
    expect(result.ok).toBe(true);
  });
});
