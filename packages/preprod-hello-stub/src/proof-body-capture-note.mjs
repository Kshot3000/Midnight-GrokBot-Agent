/**
 * Lab note: how to capture the proof-server response body that midnight-js 4.1.1 drops.
 * Does not call a proof server, wallet, indexer, or node.
 * Does not claim to fix midnight-js or the public proof server.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/243
 * Official: https://docs.midnight.network/api-reference/error-reference/proof-server-errors
 * Pins: midnight-js 4.1.1, proof-server 8.1.0, Compact ~0.31.1 / language ~0.23
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/243';
export const OFFICIAL = 'https://docs.midnight.network/api-reference/error-reference/proof-server-errors';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * Classify whether an error is the dropped-body shape and recommend a local capture.
 * @param {unknown} error
 * @returns {{ dropped: boolean, recommendation: string, upstream: string }}
 */
export function noteProofBodyCapture(error) {
  const text = typeof error === 'string' ? error : (error && error.message) || String(error || '');
  const dropped = /Failed Proof Server response/.test(text) && /code="4\d\d"/.test(text) && !/body=/.test(text);
  if (dropped) {
    return {
      dropped: true,
      recommendation:
        'midnight-js 4.1.1 drops the proof-server body (servicedesk#243). ' +
        'Set MIDNIGHT_PROOF_SERVER_VERBOSE=true on the proof-server container to log the DEBUG reason, ' +
        'or proxy the request locally to capture the body. Official errors: ' + OFFICIAL,
      upstream: UPSTREAM,
    };
  }
  return {
    dropped: false,
    recommendation: 'Not the dropped-body shape from servicedesk#243.',
    upstream: UPSTREAM,
  };
}

function selfCheck() {
  const dropped = new Error('Failed Proof Server response: url="http://127.0.0.1:6300/check", code="400", status="Bad Request"');
  const withBody = new Error('Failed Proof Server response: url="http://127.0.0.1:6300/check", code="400", status="Bad Request", body="bad input"');
  const a = noteProofBodyCapture(dropped);
  const b = noteProofBodyCapture(withBody);
  const ok = a.dropped === true && b.dropped === false;
  console.log(ok ? 'PASS' : 'FAIL');
  console.log(CREDIT);
  process.exit(ok ? 0 : 1);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  selfCheck();
}
