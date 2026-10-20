/**
 * Classify the Stagenet "Unable to get requested contract state" string.
 * Does not call RPC, does not invent an API, and does not claim a node fix.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/264
 * Official: https://docs.midnight.network/concepts/network-architecture/rpc-networking
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/264';
export const OFFICIAL_RPC = 'https://docs.midnight.network/concepts/network-architecture/rpc-networking';
export const OFFICIAL_INDEXER = 'https://docs.midnight.network/api-reference/error-reference/indexer-errors';

export const STALL_PEER = '12D3KooWPmkYvPL3NSGFGpsV3J8UD3iWVZrVuksS3JYqBhjagAa8';
export const STALL_BLOCK = 803155;
export const ERROR_STRING = 'Unable to get requested contract state';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {string} message
 * @param {string} [peer]
 */
export function classifyStagenetContractStateError(message, peer = '') {
  const raw = String(message || '');
  const isStallString = raw.includes(ERROR_STRING);
  const isKnownPeer = String(peer) === STALL_PEER || raw.includes(STALL_PEER);

  return {
    ok: !isStallString,
    kind: isStallString ? 'stagenet-validator-stall-candidate' : 'other',
    isStallString,
    isKnownPeer,
    stalledAt: isStallString ? STALL_BLOCK : null,
    hint: isStallString
      ? 'Matches the string from servicedesk#264. On Stagenet, retry or avoid the lagged validator-04 peer rather than treating it as a Compact or contract bug. This lab does not fix the node.'
      : 'Not the reported Stagenet stall string.',
    upstream: UPSTREAM,
    official: OFFICIAL_RPC,
    indexer: OFFICIAL_INDEXER,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const hit = classifyStagenetContractStateError(ERROR_STRING, STALL_PEER);
  const miss = classifyStagenetContractStateError('other error');
  const ok = hit.isStallString && hit.isKnownPeer && !hit.ok && miss.ok && !miss.isStallString;
  if (!ok) {
    console.error(JSON.stringify({ hit, miss }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM, credit: CREDIT }, null, 2));
}
