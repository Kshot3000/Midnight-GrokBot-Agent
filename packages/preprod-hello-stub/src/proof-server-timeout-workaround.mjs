/**
 * Classify the timeout-as-AbortError and dropped-body shapes from
 * midnight-js-http-client-proof-provider 4.1.1.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/243
 * Official: https://docs.midnight.network/api-reference/error-reference/proof-server-errors
 * Does not call a proof server. Does not invent APIs.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/243';
export const OFFICIAL_ERRORS = 'https://docs.midnight.network/api-reference/error-reference/proof-server-errors';
export const LOCAL_PROVING = 'https://docs.midnight.network/guides/local-proving';
export const DEFAULT_TIMEOUT_MS = 300000;

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {string | { message?: string, name?: string }} err
 * @param {{ timeoutMs?: number }} [opts]
 */
export function classifyProofServerTimeout(err, opts = {}) {
  const text = typeof err === 'string' ? err : (err && err.message) || '';
  const name = (err && err.name) || '';
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  if (/AbortError/.test(name) || /user aborted a request/i.test(text)) {
    return {
      ok: true,
      kind: 'timeout-as-abort',
      timeoutMs,
      title: 'Timeout reported as AbortError',
      hint: `midnight-js 4.1.1 reports AbortSignal.timeout(${timeoutMs}) as "The user aborted a request." Raise the provider timeout or enable verbose proof-server logging. See ${LOCAL_PROVING}.`,
      upstream: UPSTREAM,
      official: OFFICIAL_ERRORS,
      credit: CREDIT,
    };
  }

  if (/Failed Proof Server response/.test(text) && /code="400"/.test(text)) {
    return {
      ok: true,
      kind: 'dropped-body',
      title: 'Response body dropped',
      hint: 'The proof-server reason is in the body (bad input / Job Queue full / internal error on 8.x). The client message omits it. Enable MIDNIGHT_PROOF_SERVER_VERBOSE=true.',
      upstream: UPSTREAM,
      official: OFFICIAL_ERRORS,
      credit: CREDIT,
    };
  }

  return {
    ok: false,
    kind: 'unknown',
    hint: 'Does not match the timeout-as-abort or dropped-body shapes from servicedesk#243.',
    upstream: UPSTREAM,
    credit: CREDIT,
  };
}

// Built by @kshot9000 https://x.com/kshot9000
// Email: kshot9000@gmail.com
// Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
// Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
