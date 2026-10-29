/**
 * Classify a failed Merkle membership check that omitted the path.leaf bind.
 * Does not call a proof server, wallet, indexer, or node.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/63
 * Official: https://docs.midnight.network/concepts/how-midnight-works/keeping-data-private
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, proof-server 8.1.0.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/63';
export const OFFICIAL =
  'https://docs.midnight.network/concepts/how-midnight-works/keeping-data-private';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function textOf(err) {
  if (!err) return '';
  if (typeof err === 'string') return err;
  return String(err.message || err);
}

/**
 * @param {unknown} error
 * @returns {{ kind: string, hint: string, credit: string }}
 */
export function classifyPathLeafBind(error) {
  const text = textOf(error);
  if (/path is not for this item/i.test(text) || /path\.leaf/i.test(text)) {
    return {
      kind: 'path-leaf-mismatch',
      hint: 'The witness path is not bound to the claimed leaf. Assert path.leaf == item before checkRoot (private-data page).',
      credit: CREDIT,
    };
  }
  if (/path must be valid/i.test(text) || /checkRoot/i.test(text)) {
    return {
      kind: 'path-root-mismatch',
      hint: 'checkRoot failed. The path does not recompute the current tree root. After insertHash a path built for the raw preimage is not documented to succeed.',
      credit: CREDIT,
    };
  }
  return {
    kind: 'unclassified',
    hint: 'Not a documented path-leaf or checkRoot failure. See the private-data membership example.',
    credit: CREDIT,
  };
}
