/**
 * Classify Preprod wallet sync logs that mention non-linear inserts into
 * dust / zswap commitment or generation trees.
 * Does not call a node, indexer, wallet, or proof server.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1381
 * Official: https://docs.midnight.network/guides/networks-and-environments
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1381';
export const OFFICIAL = 'https://docs.midnight.network/guides/networks-and-environments';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

const NONLINEAR =
  /values inserted non-linearly into (?<tree>dust generation tree|zswap commitment tree|dust commitment tree)/i;

/**
 * @param {unknown} logOrError
 */
export function decodeNonlinearSync(logOrError) {
  const text = logOrError == null ? '' : String(typeof logOrError === 'object' && logOrError.message ? logOrError.message : logOrError);
  const match = text.match(NONLINEAR);
  if (!match) {
    return {
      ok: false,
      kind: 'unrecognized',
      tree: null,
      hint: 'No non-linear insert pattern. Official networks page describes the symptom for wallets that resume old indexer state on Blockfrost.',
      upstream: UPSTREAM,
      official: OFFICIAL,
      credit: CREDIT,
    };
  }
  const tree = match.groups.tree;
  return {
    ok: true,
    kind: 'nonlinear-insert',
    tree,
    hint: `Non-linear insert into ${tree}. Official guidance: saved sync state from the old indexer is not portable. Discard that state and sync from genesis. Do not shift cursors by hand. A full first sync on Preprod can take over an hour. This lab does not claim a fix of the public indexer or node.`,
    upstream: UPSTREAM,
    official: OFFICIAL,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const sample = 'error: values inserted non-linearly into dust commitment tree expected index received';
  const decoded = decodeNonlinearSync(sample);
  if (!decoded.ok || decoded.tree !== 'dust commitment tree') {
    console.error(JSON.stringify(decoded, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, tree: decoded.tree, credit: CREDIT }, null, 2));
}
