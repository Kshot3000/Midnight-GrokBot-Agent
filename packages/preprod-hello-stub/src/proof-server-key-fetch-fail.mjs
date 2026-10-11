/**
 * Classify the proof-server startup key-download failure described in
 * midnightntwrk/servicedesk#242.
 *
 * The image fetches parameters before binding the port. Each file gets 3
 * attempts with no pause; if all three fail the process exits with code 1
 * and a "Giving up." message. This helper only inspects a log string.
 * It does not run Docker, does not contact a proof server, and does not
 * invent an API.
 *
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/242
 * Official: https://docs.midnight.network/guides/local-proving
 * Pins: proof-server 8.1.0
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/242';
export const OFFICIAL = 'https://docs.midnight.network/guides/local-proving';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {string} logText
 * @returns {{ kind: string, givingUp: boolean, attemptsMentioned: boolean, hint: string, upstream: string, credit: string }}
 */
export function classifyKeyFetchFail(logText) {
  const text = String(logText || '');
  const givingUp = /Giving up\./.test(text) || /Failed to fetch data from .* after 3 attempts/.test(text);
  const attemptsMentioned = /after 3 attempts/.test(text) || /Retrying\.\.\./.test(text);
  if (givingUp) {
    return {
      kind: 'key-download-gave-up',
      givingUp: true,
      attemptsMentioned,
      hint: 'Proof server exited before binding the port. Mount a volume at /.cache/midnight so completed files survive a restart, or ensure MIDNIGHT_PARAM_SOURCE is reachable. This does not fix the image.',
      upstream: UPSTREAM,
      official: OFFICIAL,
      credit: CREDIT,
    };
  }
  return {
    kind: 'unrecognized',
    givingUp: false,
    attemptsMentioned,
    hint: 'Log does not match the 3-attempt key-download failure from servicedesk#242.',
    upstream: UPSTREAM,
    official: OFFICIAL,
    credit: CREDIT,
  };
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const sample = 'Error: Custom { kind: InvalidData, error: "Failed to fetch data from https://srs.midnight.network/bls_midnight_2p15 after 3 attempts. Giving up." }';
  const result = classifyKeyFetchFail(sample);
  if (result.kind !== 'key-download-gave-up' || !result.givingUp) {
    console.error(result);
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, kind: result.kind, credit: CREDIT }, null, 2));
}
