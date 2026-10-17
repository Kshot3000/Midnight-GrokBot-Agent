/**
 * Decode WorkError variants from the official proof-server error reference.
 * midnight-js 4.1.1 drops the response body, so this classifies when the body
 * or a verbose log line is available separately. Does not call a proof server,
 * wallet, indexer, or node. Does not claim to fix the public proof server.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/243
 * Official: https://docs.midnight.network/api-reference/error-reference/proof-server-errors
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, proof-server 8.1.0
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM_PROOF_PROVIDER =
  'https://github.com/midnightntwrk/servicedesk/issues/243';
export const OFFICIAL_PROOF_ERRORS =
  'https://docs.midnight.network/api-reference/error-reference/proof-server-errors';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

const WORK_ERRORS = [
  {
    name: 'BadInput',
    re: /bad input/i,
    status: 400,
    hint: 'Proof request input data is invalid. Verify the transaction was built correctly with the SDK and that ZKIR/keys are present.',
  },
  {
    name: 'CancelledUnexpectedly',
    re: /cancelled unexpectedly|CancelledUnexpectedly/i,
    status: 500,
    hint: 'The system cancelled the job without an explicit request. Internal error; retry the proof request.',
  },
  {
    name: 'InternalError',
    re: /internal error/i,
    status: 500,
    hint: 'Internal proof generation error. Check proof server logs; restart if it persists.',
  },
  {
    name: 'JoinError',
    re: /join error|JoinError/i,
    status: 500,
    hint: 'Task join error during proof generation. Internal threading error; retry or restart.',
  },
];

/**
 * @param {string} text response body, verbose log, or captured message
 * @returns {{ ok: boolean, name?: string, status?: number, hint: string }}
 */
export function decodeWorkError(text) {
  if (typeof text !== 'string') {
    return { ok: false, hint: 'Expected a string (body or log line).' };
  }
  for (const e of WORK_ERRORS) {
    if (e.re.test(text)) {
      return {
        ok: true,
        name: e.name,
        status: e.status,
        hint: `${e.hint} Upstream: ${UPSTREAM_PROOF_PROVIDER}`,
      };
    }
  }
  return { ok: false, hint: 'No official WorkError pattern matched. See ' + OFFICIAL_PROOF_ERRORS };
}

function selfCheck() {
  const cases = [
    ['bad input', 'BadInput'],
    ["bad input: `couldn't find built-in key increment`", 'BadInput'],
    ['CancelledUnexpectedly', 'CancelledUnexpectedly'],
    ['internal error: boom', 'InternalError'],
    ['JoinError', 'JoinError'],
    ['unrelated', null],
  ];
  let fails = 0;
  for (const [input, expected] of cases) {
    const r = decodeWorkError(input);
    const got = r.ok ? r.name : null;
    if (got !== expected) {
      console.error(`FAIL ${input} -> ${got} expected ${expected}`);
      fails++;
    }
  }
  if (fails) {
    console.error(CREDIT);
    process.exit(1);
  }
  console.log('proof-server-work-error-decode: ok');
  console.log(CREDIT);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  selfCheck();
}
