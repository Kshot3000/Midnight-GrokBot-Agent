/**
 * prove-path-missing-key-decode.mjs
 *
 * Classifies the "couldn't find built-in key" prove-path failure reported in
 * https://github.com/midnightntwrk/servicedesk/issues/243
 *
 * When the zk-config provider cannot supply the circuit IR, the proof-server
 * (8.x / 9.x) rejects /check or /prove with a body that includes the reason.
 * midnight-js-http-client-proof-provider 4.1.1 drops that body and only
 * surfaces the HTTP status. This module recognizes the reason when it is
 * available (logs, 9.x body, or a captured response) and points the builder
 * at the missing ZKIR / keys.
 *
 * Does not call the proof server, indexer, or node. LOCAL-TRUE.
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, proof-server 8.1.0.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/243';
export const OFFICIAL_LOCAL_PROVING = 'https://docs.midnight.network/guides/local-proving';
export const OFFICIAL_PROOF_ERRORS =
  'https://docs.midnight.network/api-reference/error-reference/proof-server-errors';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

const MISSING_KEY =
  /couldn'?t find built-in key\s+([a-zA-Z0-9_]+)/i;

const DROPPED_STATUS =
  /Failed Proof Server response:\s*url="[^"]+",\s*code="(\d+)",\s*status="([^"]+)"/;

function textOf(input) {
  if (input == null) return '';
  if (typeof input === 'string') return input;
  if (typeof input === 'object' && typeof input.message === 'string') return input.message;
  return String(input);
}

/**
 * @param {unknown} errorOrText
 * @returns {{ kind: string, circuit?: string, bodyDropped: boolean, hint: string, upstream: string, official: string, credit: string }}
 */
export function decodeMissingKeyProvePath(errorOrText) {
  const text = textOf(errorOrText).trim();
  const keyMatch = text.match(MISSING_KEY);
  const dropped = text.match(DROPPED_STATUS);

  if (keyMatch) {
    return {
      kind: 'missing-builtin-key',
      circuit: keyMatch[1],
      bodyDropped: false,
      hint: `Proof server could not find the built-in key for circuit "${keyMatch[1]}". The circuit ZKIR was not sent or is not readable. Check the zk-config provider path and that the compiled keys/zkir files exist for this circuit. midnight-js 4.1.1 drops the response body, so this reason only appears in proof-server logs (MIDNIGHT_PROOF_SERVER_VERBOSE=true) or a 9.x body you capture yourself.`,
      upstream: UPSTREAM,
      official: OFFICIAL_LOCAL_PROVING,
      credit: CREDIT,
    };
  }

  if (dropped && Number(dropped[1]) === 400) {
    return {
      kind: 'dropped-body-possible-missing-key',
      bodyDropped: true,
      hint: 'midnight-js dropped the response body (servicedesk#243). A 400 Bad Request on /check or /prove is commonly "bad input" / missing built-in key when the ZKIR is absent. Enable verbose proof-server logging and confirm the circuit IR is present before retrying.',
      upstream: UPSTREAM,
      official: OFFICIAL_PROOF_ERRORS,
      credit: CREDIT,
    };
  }

  return {
    kind: 'not-missing-key',
    bodyDropped: Boolean(dropped),
    hint: 'Does not match the missing-built-in-key prove-path shape. See the general proof-server error decoder if the body was dropped.',
    upstream: UPSTREAM,
    official: OFFICIAL_PROOF_ERRORS,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const samples = [
    "bad input: `couldn't find built-in key increment`",
    'Failed Proof Server response: url="http://127.0.0.1:6300/check", code="400", status="Bad Request"',
    'something else',
  ];
  for (const s of samples) {
    console.log(JSON.stringify({ input: s, out: decodeMissingKeyProvePath(s) }, null, 2));
  }
}
