/**
 * initswap-partial-decode.mjs — classifier for WalletFacade.initSwap partial-tx risk.
 *
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/99
 * Official: https://docs.midnight.network/sdks/official/build-a-wallet
 *   (makeIntent → initSwap: ignores outputs of a kind whose inputs key is missing;
 *    payFees defaults to false)
 *
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.
 * Does not invent APIs. Does not claim a fix of the public indexer, node, or wallet SDK.
 * LOCAL-TRUE. Pure function only.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const INITSWAP_PARTIAL_DOCS = {
  upstream: 'https://github.com/midnightntwrk/servicedesk/issues/99',
  official: 'https://docs.midnight.network/sdks/official/build-a-wallet',
  note: 'initSwap ignores outputs of a kind whose inputs key is missing; payFees defaults to false. Pass both input keys.',
};

export const builderCredit =
  'Built by @kshot9000 https://x.com/kshot9000\n' +
  'Email: kshot9000@gmail.com\n' +
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v\n' +
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation';

/**
 * Classify a proposed initSwap call shape against the partial-tx risk reported in #99.
 * @param {{ inputs?: { shielded?: object, unshielded?: object }, outputs?: Array<{ type?: string }> }} shape
 * @returns {{ risk: boolean, missing: string[], note: string, upstream: string }}
 */
export function classifyInitSwapPartial(shape) {
  const missing = [];
  const inputs = shape && typeof shape.inputs === 'object' ? shape.inputs : {};
  const outputs = Array.isArray(shape && shape.outputs) ? shape.outputs : [];

  const hasShieldedOut = outputs.some((o) => o && o.type === 'shielded');
  const hasUnshieldedOut = outputs.some((o) => o && o.type === 'unshielded');

  if (hasShieldedOut && inputs.shielded === undefined) {
    missing.push('shielded');
  }
  if (hasUnshieldedOut && inputs.unshielded === undefined) {
    missing.push('unshielded');
  }

  if (missing.length > 0) {
    return {
      risk: true,
      missing,
      note: `servicedesk#99: initSwap will drop ${missing.join(' and ')} outputs because the matching inputs key is missing. Pass both keys (empty objects allowed). payFees defaults to false.`,
      upstream: INITSWAP_PARTIAL_DOCS.upstream,
    };
  }

  return {
    risk: false,
    missing: [],
    note: 'Both kinds present in inputs or no mixed outputs; no partial-tx risk from the reported rule.',
    upstream: INITSWAP_PARTIAL_DOCS.upstream,
  };
}

// Self-check when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const sample = {
    inputs: { shielded: { tokenA: 1n } },
    outputs: [{ type: 'unshielded' }, { type: 'shielded' }],
  };
  console.log(classifyInitSwapPartial(sample));
}
