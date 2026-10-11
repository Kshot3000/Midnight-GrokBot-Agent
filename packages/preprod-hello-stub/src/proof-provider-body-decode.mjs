/**
 * Decode midnight-js proof-provider errors that drop the proof-server response body.
 * Does not call a proof server, wallet, indexer, or node.
 * Does not claim to fix the public proof server or midnight-js.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/243
 * Official: https://docs.midnight.network/api-reference/error-reference/proof-server-errors
 * Pins: midnight-js 4.1.1, proof-server 8.1.0
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM_PROOF_PROVIDER_BODY =
  'https://github.com/midnightntwrk/servicedesk/issues/243';
export const OFFICIAL_PROOF_ERRORS =
  'https://docs.midnight.network/api-reference/error-reference/proof-server-errors';

export const LAB_PROOF_SERVER = 'midnightntwrk/proof-server:8.1.0';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/** Status codes and short names from the official proof-server error reference. */
const STATUS_HINTS = Object.freeze({
  400: {
    name: 'BadInput or JobNotPending',
    hint: '400 Bad Request often means BadInput (malformed preimage / missing ZKIR) or JobNotPending. The body would say which; midnight-js 4.1.1 drops it.',
  },
  428: {
    name: 'JobMissing',
    hint: '428 Precondition Required is JobMissing(Uuid). The job id is invalid or expired.',
  },
  429: {
    name: 'JobQueueFull',
    hint: '429 Too Many Requests is JobQueueFull. Wait and retry with backoff.',
  },
  500: {
    name: 'Internal / ChannelClosed / JoinError',
    hint: '500 Internal Server Error can be ChannelClosed, CancelledUnexpectedly, InternalError, or JoinError. Check proof-server logs.',
  },
});

function textOf(error) {
  if (error == null) return '';
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && typeof error.message === 'string') return error.message;
  return String(error);
}

/**
 * Extract a short reason from a proof-server body string when it is available.
 * On 8.x the body is typically "bad input", "Job Queue full", or "internal error".
 * On 9.x it can be "bad input: `reason`".
 * @param {string} body
 */
export function extractProofServerReason(body) {
  const raw = String(body || '').trim();
  if (!raw) return null;
  const m = raw.match(/bad input:\s*`([^`]*)`/i) || raw.match(/bad input:\s*(.+)/i);
  if (m) return m[1].trim();
  if (/bad input/i.test(raw)) return 'bad input';
  if (/Job Queue full/i.test(raw)) return 'Job Queue full';
  if (/internal error/i.test(raw)) return 'internal error';
  return raw.length > 120 ? raw.slice(0, 117) + '...' : raw;
}

/**
 * Classify a proof-provider failure that lost the response body or misreported a timeout.
 * Shape matches the lab test for servicedesk#243.
 * If the error text already contains a body=... fragment (future or wrapped clients), the reason is extracted.
 * @param {unknown} error
 */
export function decodeProofProviderError(error) {
  const text = textOf(error);
  const isAbort =
    /AbortError/i.test(text) || /user aborted a request/i.test(text) || /timed? ?out/i.test(text);
  const failedResp = text.match(
    /Failed Proof Server response:\s*url="([^"]*)",\s*code="(\d+)",\s*status="([^"]*)"(?:,\s*body="([^"]*)")?/,
  );

  if (isAbort && !failedResp) {
    return {
      kind: 'timeout',
      ok: true,
      isTimeout: true,
      status: null,
      code: null,
      body: null,
      bodyDropped: false,
      reason: null,
      hint: 'AbortError / "The user aborted a request" is how midnight-js 4.1.1 reports a proof-server timeout. The configured timeout fired; it is not a user cancel.',
      upstream: UPSTREAM_PROOF_PROVIDER_BODY,
      official: OFFICIAL_PROOF_ERRORS,
      credit: CREDIT,
    };
  }

  if (failedResp) {
    const url = failedResp[1];
    const code = failedResp[2];
    const statusNum = Number(code);
    const statusText = failedResp[3];
    const body = failedResp[4] || null;
    const known = STATUS_HINTS[statusNum] || null;
    const reason = body ? extractProofServerReason(body) : null;
    return {
      kind: body ? 'http-error-with-body' : 'http-error-body-dropped',
      ok: true,
      isTimeout: false,
      url,
      status: statusNum,
      code,
      statusText,
      body,
      bodyDropped: !body,
      reason,
      name: known ? known.name : null,
      hint:
        (known ? known.hint : `HTTP ${code} ${statusText}.`) +
        (body
          ? ` Body reason: ${reason}.`
          : ' Response body was not included. See servicedesk#243: the provider never reads the body, so the server reason ("bad input", "Job Queue full", or "couldn\'t find built-in key …") is lost.'),
      upstream: UPSTREAM_PROOF_PROVIDER_BODY,
      official: OFFICIAL_PROOF_ERRORS,
      credit: CREDIT,
    };
  }

  return {
    kind: 'unrecognized',
    ok: false,
    isTimeout: false,
    bodyDropped: false,
    code: null,
    body: null,
    reason: null,
    hint: 'Not a known midnight-js proof-provider wrapper. Expected "Failed Proof Server response: url=…, code=…, status=…" or an AbortError timeout.',
    upstream: UPSTREAM_PROOF_PROVIDER_BODY,
    official: OFFICIAL_PROOF_ERRORS,
    credit: CREDIT,
  };
}

/** Self-check used by the vitest file. */
export function checkProofProviderBody() {
  const failures = [];
  const dropped = decodeProofProviderError(
    'Error: Failed Proof Server response: url="http://127.0.0.1:6300/check", code="400", status="Bad Request"',
  );
  if (!dropped.bodyDropped) failures.push('400 must mark bodyDropped');
  if (dropped.code !== '400') failures.push('code must be the string "400"');
  if (dropped.body !== null) failures.push('body must stay null (dropped)');
  if (dropped.kind !== 'http-error-body-dropped') failures.push('400 kind');
  if (dropped.reason !== null) failures.push('dropped must have null reason');

  const withBody = decodeProofProviderError(
    'Error: Failed Proof Server response: url="http://127.0.0.1:6300/check", code="400", status="Bad Request", body="bad input: `couldn\'t find built-in key increment`"',
  );
  if (withBody.bodyDropped) failures.push('with-body must not mark bodyDropped');
  if (withBody.reason !== "couldn't find built-in key increment") failures.push('reason extract');
  if (withBody.kind !== 'http-error-with-body') failures.push('with-body kind');

  const timeout = decodeProofProviderError('AbortError: The user aborted a request.');
  if (!timeout.isTimeout) failures.push('AbortError must set isTimeout');
  if (timeout.kind !== 'timeout') failures.push('timeout kind');

  return {
    ok: failures.length === 0,
    failures,
    upstream: UPSTREAM_PROOF_PROVIDER_BODY,
    official: OFFICIAL_PROOF_ERRORS,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const result = checkProofProviderBody();
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM_PROOF_PROVIDER_BODY, credit: CREDIT }, null, 2));
}
