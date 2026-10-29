/**
 * Decode midnight-js HTTP proof-provider errors that drop the proof-server body
 * or report a timeout as "The user aborted a request."
 * Does not call a proof server and does not claim a midnight-js or proof-server fix.
 *
 * Official: https://docs.midnight.network/guides/local-proving
 * Official: https://docs.midnight.network/api-reference/error-reference/proof-server-errors
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/243
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/243';
export const OFFICIAL_PROVING = 'https://docs.midnight.network/guides/local-proving';
export const OFFICIAL_ERRORS = 'https://docs.midnight.network/api-reference/error-reference/proof-server-errors';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function textOf(error) {
  if (error == null) return '';
  if (typeof error === 'string') return error;
  if (typeof error === 'object') {
    const parts = [];
    const seen = new Set();
    const walk = (value, depth) => {
      if (value == null || depth > 5 || seen.has(value)) return;
      if (typeof value === 'string' || typeof value === 'number') {
        parts.push(String(value));
        return;
      }
      if (typeof value !== 'object') return;
      seen.add(value);
      if (Array.isArray(value)) {
        for (const item of value) walk(item, depth + 1);
        return;
      }
      for (const key of ['message', 'cause', 'name', 'code', 'status', 'body', 'url']) {
        if (key in value) walk(value[key], depth + 1);
      }
    };
    walk(error, 0);
    if (parts.length) return parts.join(' ');
  }
  return String(error);
}

/**
 * Classify a proof-provider error observed from midnight-js 4.1.1 (or similar).
 * @param {unknown} error
 * @returns {object}
 */
export function decodeProofProviderError(error) {
  const text = textOf(error);
  const failedResponse = /Failed Proof Server response/i.test(text);
  const statusMatch = text.match(/code=["']?(\d+)["']?/i) || text.match(/\b(400|429|500|503)\b/);
  const status = statusMatch ? Number(statusMatch[1]) : null;
  const aborted = /The user aborted a request/i.test(text) || /AbortError/i.test(text);
  const timedOut = aborted || /timed out/i.test(text) || /timeout/i.test(text);
  const bodyMatch = text.match(/body=["']([^"']+)["']/i) || text.match(/bad input[:\s]+([^"\n]+)/i);
  const body = bodyMatch ? bodyMatch[1].trim() : null;
  const missingKey = /couldn't find built-in key/i.test(text) || /zkir/i.test(text);
  const queueFull = /Job Queue full/i.test(text) || status === 429;
  const badInput = /bad input/i.test(text) || status === 400;

  const base = {
    upstream: UPSTREAM,
    officialProving: OFFICIAL_PROVING,
    officialErrors: OFFICIAL_ERRORS,
    claim: 'local classification of an already-observed error string — not a midnight-js or proof-server fix',
    pins: 'midnight-js 4.1.1 · proof-server 8.1.0 · Compact ~0.31.1',
    credit: CREDIT,
  };

  if (timedOut && aborted && !failedResponse) {
    return {
      ...base,
      ok: true,
      classification: 'timeout-reported-as-abort',
      status,
      body,
      hint: 'servicedesk#243: AbortSignal.timeout on the proof provider surfaces as AbortError: The user aborted a request. (midnight-js 4.1.1). The message does not say a timeout fired or the duration (default 300000 ms on prove). Check the proof server is healthy on :6300 and that the request is not hanging on missing keys.',
    };
  }

  if (failedResponse && status && !body) {
    return {
      ...base,
      ok: true,
      classification: 'response-body-dropped',
      status,
      body: null,
      hint: 'servicedesk#243: midnight-js-http-client-proof-provider (4.1.1) throws Failed Proof Server response with only url/code/status. It never reads the response body. On proof-server 8.x the body is "bad input", "Job Queue full", or "internal error". From 9.0.0-rc.9 it includes the reason (e.g. couldn\'t find built-in key increment). This lab does not invent the missing body.',
    };
  }

  if (failedResponse && body) {
    let kind = 'body-present';
    if (missingKey) kind = 'missing-builtin-key';
    else if (queueFull) kind = 'queue-full';
    else if (badInput) kind = 'bad-input';
    return {
      ...base,
      ok: true,
      classification: kind,
      status,
      body,
      hint: missingKey
        ? 'Body names a missing built-in or circuit key. Confirm zkir/ and keys/ are readable by the zkConfigProvider (midnight-js#781). Recompile with Compact 0.31.1 if keys are stale.'
        : 'Body was present in this sample. Official proof-server-errors lists BadInput (400), Job Queue full (429), and internal errors (500).',
    };
  }

  if (queueFull) {
    return {
      ...base,
      ok: true,
      classification: 'queue-full',
      status: status || 429,
      body,
      hint: 'Official local-proving: HTTP 429 Job Queue full is not retried by httpClientProofProvider. Wait and retry, or raise the worker limit via env.',
    };
  }

  return {
    ...base,
    ok: false,
    classification: 'unclassified',
    status,
    body,
    hint: 'No Failed Proof Server response, abort/timeout, or known body pattern. This helper does not contact a proof server.',
  };
}

export const proofProviderErrorCredit = CREDIT;

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const dropped = decodeProofProviderError(
    'Failed Proof Server response: url="http://127.0.0.1:6300/check", code="400", status="Bad Request"',
  );
  const abort = decodeProofProviderError('AbortError: The user aborted a request.');
  const withBody = decodeProofProviderError(
    'Failed Proof Server response: url="http://127.0.0.1:6300/check", code="400", status="Bad Request", body="bad input: couldn\'t find built-in key increment"',
  );
  const ok = dropped.classification === 'response-body-dropped'
    && abort.classification === 'timeout-reported-as-abort'
    && withBody.classification === 'missing-builtin-key';
  if (!ok) {
    console.error(JSON.stringify({ dropped, abort, withBody }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, classification: dropped.classification, credit: CREDIT }, null, 2));
}
