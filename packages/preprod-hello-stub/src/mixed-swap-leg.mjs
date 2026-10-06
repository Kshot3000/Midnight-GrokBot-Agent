/**
 * Classify a mixed shielded/unshielded initSwap shape reported on Preview.
 * Does not call WalletFacade, does not submit, and does not invent an API.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/99
 * Official same-kind example: https://docs.midnight.network/sdks/official/wallet-developer-guide
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_MIXED_SWAP = 'https://github.com/midnightntwrk/servicedesk/issues/99';
export const OFFICIAL_SWAP_GUIDE = 'https://docs.midnight.network/sdks/official/wallet-developer-guide';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function kindsOf(value) {
  if (!value || typeof value !== 'object') return [];
  return ['shielded', 'unshielded'].filter((kind) => value[kind] != null);
}

function outputKinds(outputs) {
  if (!Array.isArray(outputs)) return [];
  return [...new Set(outputs.map((row) => row && row.type).filter((kind) => kind === 'shielded' || kind === 'unshielded'))];
}

/**
 * @param {object} request { inputs, outputs }
 * @param {object} [tx] snapshot of the object initSwap returned, if any
 */
export function classifyMixedSwap(request = {}, tx) {
  const inputKinds = kindsOf(request.inputs);
  const wanted = outputKinds(request.outputs);
  const mixed =
    inputKinds.length > 0 &&
    wanted.length > 0 &&
    wanted.some((kind) => !inputKinds.includes(kind));
  const intentsEmpty = tx != null && (tx.intents == null || (typeof tx.intents === 'object' && Object.keys(tx.intents).length === 0));
  const offerMissing = tx != null && (tx.guaranteedOffer == null && tx.guaranteed_coins == null);
  const droppedUnshielded = mixed && wanted.includes('unshielded') && !inputKinds.includes('unshielded') && intentsEmpty;
  const droppedShielded = mixed && wanted.includes('shielded') && !inputKinds.includes('shielded') && offerMissing;
  const oneLegged = droppedUnshielded || droppedShielded;
  let classification = 'not-a-mixed-swap';
  if (oneLegged) classification = 'one-legged-initSwap';
  else if (mixed) classification = 'mixed-swap-unsupported';
  else if (inputKinds.length && wanted.length) classification = 'same-kind-offer';
  return {
    ok: classification === 'same-kind-offer' || classification === 'not-a-mixed-swap',
    classification,
    inputKinds,
    outputKinds: wanted,
    mixed,
    oneLegged,
    treatAsCompleteOffer: false,
    fixesWallet: false,
    fixesIndexer: false,
    fixesNode: false,
    upstream: UPSTREAM_MIXED_SWAP,
    official: OFFICIAL_SWAP_GUIDE,
    hint: mixed
      ? 'servicedesk#99: mixed initSwap can return only the input-kind leg and still submit. Official guide shows a shielded-for-shielded initSwap, then finalizeRecipe, then the counterparty balanceFinalizedTransaction. This lab refuses the mixed shape. It does not fix the wallet, public indexer, or node.'
      : 'Same-kind shape matches the published wallet guide example. This lab does not call initSwap.',
    credit: CREDIT,
  };
}
