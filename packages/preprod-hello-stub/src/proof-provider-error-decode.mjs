/**
 * Classify midnight-js proof-provider errors that drop the proof-server body
 * or surface a timeout as an AbortError. Does not call a proof server.
 *
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/243
 * Proof-server errors table:
 *   https://docs.midnight.network/api-reference/error-reference/proof-server-errors
 * Verbose logging for rejected requests:
 *   https://docs.midnight.network/guides/local-proving
 * Default prove timeout (300000 ms):
 *   https://docs.midnight.network/0.0.0/develop/reference/midnight-api/midnight-js/@midnight-ntwrk/midnight-js-http-client-proof-provider/variables/DEFAULT_CONFIG
 *
 * Pins: midnight-js 4.1.1, proof-server 8.1.0, DApp Connector 4.0.1.
 * Official docs only: https://docs.midnight.network/.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/243';
export const PROOF_SERVER_ERRORS =
  'https://docs.midnight.network/api-reference/error-reference/proof-server-errors';
export const LOCAL_PROVING = 'https://docs.midnight.network/guides/local-proving';
export const DEFAULT_TIMEOUT_MS = 300000;

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {string | { message?: string }} err
 */
export function decodeProofProviderError(err) {
  const text =
    typeof err === 'string'
      ? err
      : err && typeof err.message === 'string'
        ? err.message
        : '';

  if (!text.trim()) {
    return {
      ok: false,
      classification: 'incomplete',
      title: 'proof-provider error empty',
      hint: 'Pass the Error.message from httpClientProvingProvider. This helper does not call a proof server.',
      upstream: UPSTREAM,
      docs: PROOF_SERVER_ERRORS,
      credit: CREDIT,
    };
  }

  const failedResponse = /Failed Proof Server response:\s*url="([^"]*)".*code="(\d+)".*status="([^"]*)"/i.exec(
    text,
  );
  if (failedResponse) {
    const [, url, code, status] = failedResponse;
    return {
      ok: true,
      classification: 'dropped-body',
      url,
      code: Number(code),
      status,
      title: 'midnight-js dropped the proof-server response body',
      hint:
        'On midnight-js 4.1.1 the httpClientProvingProvider throws this string and never reads the body. The body is where proof-server 8.x reports BadInput, Job Queue full, or InternalError. Enable MIDNIGHT_PROOF_SERVER_VERBOSE=true (see local-proving) so the server logs the reason at DEBUG. This decode does not fix the public indexer or node.',
      upstream: UPSTREAM,
      docs: PROOF_SERVER_ERRORS,
      verbose: LOCAL_PROVING,
      claim: 'message classification only — not a node or indexer fix',
      credit: CREDIT,
    };
  }

  const abort =
    /AbortError:\s*The user aborted a request/i.test(text) ||
    /Proof Server request failed:.*AbortError/i.test(text);
  if (abort) {
    return {
      ok: true,
      classification: 'timeout-as-abort',
      defaultTimeoutMs: DEFAULT_TIMEOUT_MS,
      title: 'proof request timed out but surfaced as AbortError',
      hint:
        'AbortSignal.timeout on the prove/check fetch becomes AbortError: The user aborted a request. on midnight-js 4.1.1. The documented default timeout is 300000 ms. Raise the timeout option on httpClientProvingProvider or reduce circuit size. This is not a user cancellation.',
      upstream: UPSTREAM,
      docs: LOCAL_PROVING,
      claim: 'message classification only — not a node or indexer fix',
      credit: CREDIT,
    };
  }

  return {
    ok: false,
    classification: 'unrecognized',
    title: 'not the recorded proof-provider drop or abort',
    hint: 'Look for Failed Proof Server response: ... code=... or AbortError: The user aborted a request.',
    upstream: UPSTREAM,
    docs: PROOF_SERVER_ERRORS,
    credit: CREDIT,
  };
}

export const proofProviderErrorCredit = CREDIT;
