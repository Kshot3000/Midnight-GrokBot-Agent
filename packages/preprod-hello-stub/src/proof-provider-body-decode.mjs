/**
 * Classify the error string midnight-js 4.1.1's http-client-proof-provider throws.
 *
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/243
 * Official proof-server error shapes: https://docs.midnight.network/api-reference/error-reference/proof-server-errors
 * Official provider: https://docs.midnight.network/api-reference/midnight-js/@midnight-ntwrk/midnight-js-http-client-proof-provider
 *
 * The client at 4.1.1 (and the same lines on main) throws
 * "Failed Proof Server response: url=..., code=\"400\", status=\"Bad Request\""
 * and never includes the response body. On 8.x the body is "bad input",
 * "Job Queue full", or "internal error". A timeout surfaces as
 * AbortError: The user aborted a request.
 *
 * This classifier only inspects a string or Error the caller already has.
 * It does not call a proof server, does not patch midnight-js, and does not
 * claim the public proof server, indexer, or node is fixed.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/243';
export const OFFICIAL_ERRORS = 'https://docs.midnight.network/api-reference/error-reference/proof-server-errors';
export const OFFICIAL_PROVIDER =
  'https://docs.midnight.network/api-reference/midnight-js/@midnight-ntwrk/midnight-js-http-client-proof-provider';
export const MIDNIGHT_JS_PIN = '4.1.1';
export const PROOF_SERVER_PIN = '8.1.0';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {string | Error | { message?: string, name?: string }} err
 */
export function decodeProofProviderError(err) {
  const raw = err instanceof Error ? err.message : typeof err === 'string' ? err : String(err?.message || '');
  const name = err instanceof Error ? err.name : typeof err === 'object' && err ? err.name : '';
  const text = `${name}: ${raw}`.replace(/^: /, '');

  const isTimeout =
    /AbortError/i.test(text) ||
    /user aborted a request/i.test(text) ||
    /timed out/i.test(text);

  const isFailedResponse = /Failed Proof Server response/i.test(text);
  const codeMatch = text.match(/code=["'](\d+)["']/);
  const statusMatch = text.match(/status=["']([^"']+)["']/);
  const bodyMatch = text.match(/body=["']([^"']*)["']/);

  let kind = 'unknown';
  let hint = 'Inspect the proof-server container logs (DEBUG on 8.x) or re-issue the request and read the body.';
  if (isTimeout) {
    kind = 'timeout';
    hint = 'The client reports a timeout as AbortError / "The user aborted a request." Official DEFAULT_CONFIG.timeout is 300000 ms.';
  } else if (isFailedResponse) {
    kind = 'failed-response-body-dropped';
    if (bodyMatch) {
      kind = 'failed-response-with-body';
      hint = 'Body was present; classify against the official proof-server error table.';
    } else {
      hint =
        'midnight-js 4.1.1 drops the response body. On 8.x the body is typically "bad input", "Job Queue full", or "internal error". See proof-server logs for the DEBUG reason (e.g. BadInput("couldn\'t find built-in key ...")).';
    }
  }

  return {
    kind,
    code: codeMatch ? codeMatch[1] : null,
    status: statusMatch ? statusMatch[1] : null,
    body: bodyMatch ? bodyMatch[1] : null,
    isTimeout,
    bodyDropped: isFailedResponse && !bodyMatch,
    hint,
    upstream: UPSTREAM,
    official: OFFICIAL_ERRORS,
    credit: CREDIT,
  };
}

export function checkProofProviderBody() {
  const dropped = decodeProofProviderError(
    'Error: Failed Proof Server response: url="http://127.0.0.1:6300/check", code="400", status="Bad Request"',
  );
  const withBody = decodeProofProviderError(
    'Error: Failed Proof Server response: url="http://127.0.0.1:6300/check", code="400", status="Bad Request", body="bad input: couldn\'t find built-in key increment"',
  );
  const timeout = decodeProofProviderError('AbortError: The user aborted a request.');
  const failures = [];
  if (!dropped.bodyDropped || dropped.kind !== 'failed-response-body-dropped') failures.push('dropped case');
  if (withBody.bodyDropped || withBody.body == null) failures.push('body case');
  if (!timeout.isTimeout || timeout.kind !== 'timeout') failures.push('timeout case');
  return {
    ok: failures.length === 0,
    failures,
    upstream: UPSTREAM,
    official: OFFICIAL_ERRORS,
    credit: CREDIT,
  };
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const result = checkProofProviderBody();
  console.log(JSON.stringify({ ...result, credit: undefined }, null, 2));
  console.log(CREDIT);
  process.exit(result.ok ? 0 : 1);
}

