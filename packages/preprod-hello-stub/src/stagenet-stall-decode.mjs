/**
 * Classify the Stagenet "Unable to get requested contract state" message.
 * Does not call a node, indexer, proof server, or wallet.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/264
 * Official: https://docs.midnight.network/api-reference/error-reference/indexer-errors
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM_STALL = 'https://github.com/midnightntwrk/servicedesk/issues/264';
export const OFFICIAL_INDEXER_ERRORS =
  'https://docs.midnight.network/api-reference/error-reference/indexer-errors';
export const OFFICIAL_NETWORKS = 'https://docs.midnight.network/guides/networks-and-environments';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

const STALL_MESSAGE = 'Unable to get requested contract state';

function textOf(error) {
  if (error == null) return '';
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && typeof error.message === 'string') return error.message;
  return String(error);
}

/**
 * Match the exact string reported in servicedesk#264.
 * @param {unknown} error
 */
export function decodeStagenetStall(error) {
  const text = textOf(error).trim();
  if (text.includes(STALL_MESSAGE)) {
    return {
      kind: 'stagenet-validator-stall',
      ok: true,
      message: STALL_MESSAGE,
      hint: 'A minority of requests to a load-balanced Stagenet RPC can land on a stalled validator (validator-04 at block 803155). Retry the call. This does not fix the public node.',
      upstream: UPSTREAM_STALL,
      official: OFFICIAL_INDEXER_ERRORS,
      credit: CREDIT,
    };
  }
  return {
    kind: 'unrecognized',
    ok: false,
    message: null,
    hint: `no match for '${STALL_MESSAGE}'. See indexer error reference for GetContractState.`,
    upstream: UPSTREAM_STALL,
    official: OFFICIAL_INDEXER_ERRORS,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const sample = 'Unable to get requested contract state';
  const decoded = decodeStagenetStall(sample);
  const ok = decoded.ok && decoded.kind === 'stagenet-validator-stall';
  if (!ok) {
    console.error(JSON.stringify(decoded, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, kind: decoded.kind, credit: CREDIT }, null, 2));
}
