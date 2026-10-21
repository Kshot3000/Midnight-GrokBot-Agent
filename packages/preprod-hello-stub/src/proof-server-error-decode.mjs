/**
 * Decode proof-server HTTP responses and midnight-js wrappers that drop the body.
 * Does not call a proof server, wallet, indexer, or node.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/243
 * Official reference: https://docs.midnight.network/api-reference/error-reference/proof-server-errors
 * Local proving guide: https://docs.midnight.network/guides/local-proving
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM_PROOF_PROVIDER = 'https://github.com/midnightntwrk/servicedesk/issues/243';
export const OFFICIAL_PROOF_ERRORS =
  'https://docs.midnight.network/api-reference/error-reference/proof-server-errors';
export const OFFICIAL_LOCAL_PROVING = 'https://docs.midnight.network/guides/local-proving';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/** Documented WorkerPoolError and WorkError names from the official reference. */
export const DOCUMENTED_PROOF_ERRORS = Object.freeze({
  JobNotPending: { status: 400, kind: 'worker-pool', hint: 'Job is already processing, completed, or cancelled.' },
  JobMissing: { status: 428, kind: 'worker-pool', hint: 'The job ID is invalid or has expired.' },
  JobQueueFull: { status: 429, kind: 'worker-pool', hint: 'Wait and retry; the server is under heavy load.' },
  ChannelClosed: { status: 500, kind: 'worker-pool', hint: 'Restart the proof server.' },
  BadInput: { status: 400, kind: 'work', hint: 'Check the transaction data being sent for proving.' },
  CancelledUnexpectedly: { status: 500, kind: 'work', hint: 'Internal error; retry the proof request.' },
  InternalError: { status: 500, kind: 'work', hint: 'Check proof server logs; restart if the error persists.' },
  JoinError: { status: 500, kind: 'work', hint: 'Internal threading error; retry or restart.' },
});

const DROPPED_BODY =
  /Failed Proof Server response:\s*url="(?<url>[^"]+)",\s*code="(?<code>\d+)",\s*status="(?<status>[^"]+)"/;

const ABORT =
  /AbortError:\s*The user aborted a request\.|Proof Server request failed:.*AbortError:\s*The user aborted a request\./;

function textOf(error) {
  if (error == null) return '';
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && typeof error.message === 'string') return error.message;
  return String(error);
}

/**
 * Classify a proof-server or midnight-js proving error.
 * midnight-js 4.1.1 drops the response body (servicedesk#243).
 * @param {unknown} error
 */
export function decodeProofServerError(error) {
  const text = textOf(error).trim();
  const dropped = text.match(DROPPED_BODY);
  const abort = ABORT.test(text);

  if (abort) {
    return {
      kind: 'timeout-or-abort',
      ok: false,
      bodyDropped: false,
      status: null,
      hint: 'midnight-js 4.1.1 reports AbortError "The user aborted a request." for a timeout. Check proof-server logs and increase timeout if the circuit is large. See servicedesk#243.',
      upstream: UPSTREAM_PROOF_PROVIDER,
      official: OFFICIAL_LOCAL_PROVING,
      credit: CREDIT,
    };
  }

  if (dropped) {
    const code = Number(dropped.groups.code);
    const statusText = dropped.groups.status;
    const documented = Object.entries(DOCUMENTED_PROOF_ERRORS).find(([, v]) => v.status === code);
    return {
      kind: 'dropped-body',
      ok: false,
      bodyDropped: true,
      status: code,
      statusText,
      url: dropped.groups.url,
      possibleError: documented ? documented[0] : null,
      hint: documented
        ? `midnight-js dropped the response body (servicedesk#243). Status ${code} matches documented ${documented[0]}: ${documented[1].hint} Enable MIDNIGHT_PROOF_SERVER_VERBOSE=true and check container logs for the real reason.`
        : `midnight-js dropped the response body (servicedesk#243). Status ${code} ${statusText}. Check proof-server logs with verbose logging. Official reference lists WorkerPoolError and WorkError names.`,
      upstream: UPSTREAM_PROOF_PROVIDER,
      official: OFFICIAL_PROOF_ERRORS,
      credit: CREDIT,
    };
  }

  const named = Object.keys(DOCUMENTED_PROOF_ERRORS).find((name) => text.includes(name));
  if (named) {
    const info = DOCUMENTED_PROOF_ERRORS[named];
    return {
      kind: 'named-proof-error',
      ok: true,
      bodyDropped: false,
      proofServerError: named,
      status: info.status,
      hint: info.hint,
      upstream: UPSTREAM_PROOF_PROVIDER,
      official: OFFICIAL_PROOF_ERRORS,
      credit: CREDIT,
    };
  }

  return {
    kind: 'unrecognized',
    ok: false,
    bodyDropped: false,
    message: text.slice(0, 200),
    hint: 'Not a documented proof-server error name or the midnight-js dropped-body wrapper. See the official proof-server error reference.',
    upstream: UPSTREAM_PROOF_PROVIDER,
    official: OFFICIAL_PROOF_ERRORS,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const sample =
    'Failed Proof Server response: url="http://127.0.0.1:6300/prove", code="400", status="Bad Request"';
  const decoded = decodeProofServerError(sample);
  const abort = decodeProofServerError(new Error('AbortError: The user aborted a request.'));
  const named = decodeProofServerError('BadInput(malformed)');
  const ok = decoded.bodyDropped && decoded.status === 400 && abort.kind === 'timeout-or-abort' && named.proofServerError === 'BadInput';
  if (!ok) {
    console.error(JSON.stringify({ decoded, abort, named }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, bodyDropped: true, credit: CREDIT }, null, 2));
}
