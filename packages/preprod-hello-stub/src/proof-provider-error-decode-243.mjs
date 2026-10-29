/**
 * Decode symptoms of midnight-js proof provider dropping the proof server body
 * and reporting timeouts as AbortError "The user aborted a request."
 * Does not call a proof server, wallet, indexer, or node.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/243
 * Fix tracked: https://github.com/midnightntwrk/midnight-js/issues/1459
 * Official proof-server errors: https://docs.midnight.network/api-reference/error-reference/proof-server-errors
 * Local proving: https://docs.midnight.network/guides/local-proving
 * DEFAULT_TIMEOUT: https://docs.midnight.network/api-reference/midnight-js/@midnight-ntwrk/midnight-js-http-client-proof-provider/variables/DEFAULT_TIMEOUT
 *
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM_PROOF_PROVIDER_DROP = 'https://github.com/midnightntwrk/servicedesk/issues/243';
export const MIDNIGHT_JS_FIX = 'https://github.com/midnightntwrk/midnight-js/issues/1459';
export const OFFICIAL_PROOF_ERRORS =
  'https://docs.midnight.network/api-reference/error-reference/proof-server-errors';
export const OFFICIAL_LOCAL_PROVING = 'https://docs.midnight.network/guides/local-proving';
export const OFFICIAL_DEFAULT_TIMEOUT =
  'https://docs.midnight.network/api-reference/midnight-js/@midnight-ntwrk/midnight-js-http-client-proof-provider/variables/DEFAULT_TIMEOUT';

export const LAB_PINS = Object.freeze({
  compactToolchain: '0.31.1',
  language: '0.23',
  midnightJs: '4.1.1',
  dappConnector: '4.0.1',
  proofServer: '8.1.0',
});

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/** Known proof-server body fragments from the error reference and local-proving guide. */
const PROOF_BODY_HINTS = [
  { needle: 'bad input', kind: 'bad-input', hint: 'Proof server rejected the request (BadInput). Check circuit keys and ZKIR; recompile and reload keys.' },
  { needle: 'Job Queue full', kind: 'queue-full', hint: 'Proof server job queue is full (429). Reduce concurrency or raise job capacity; see local-proving guide.' },
  { needle: 'JobNotPending', kind: 'job-not-pending', hint: 'Worker-pool error: tried to cancel a non-pending job.' },
  { needle: 'JobMissing', kind: 'job-missing', hint: 'Referenced proof job not found.' },
  { needle: 'ChannelClosed', kind: 'channel-closed', hint: 'Internal work channel closed; restart the proof server.' },
  { needle: 'InternalError', kind: 'internal', hint: 'Internal proof generation error; check proof-server logs.' },
  { needle: 'CancelledUnexpectedly', kind: 'cancelled', hint: 'Job cancelled without an explicit request; retry.' },
];

function textOf(error) {
  if (error == null) return '';
  if (typeof error === 'string') return error;
  if (typeof error === 'object') {
    const parts = [];
    if (typeof error.message === 'string') parts.push(error.message);
    if (typeof error.cause?.message === 'string') parts.push(error.cause.message);
    if (parts.length) return parts.join(' <- ');
  }
  return String(error);
}

/**
 * Classify a proof-provider or proving-provider rejection.
 * Recognizes the dropped-body symptom (status only) and the abort-as-timeout symptom.
 * @param {unknown} error
 * @param {{ timeoutMs?: number }} [opts]
 */
export function decodeProofProviderError(error, opts = {}) {
  const text = textOf(error).trim();
  const timeoutMs = typeof opts.timeoutMs === 'number' ? opts.timeoutMs : 300000;

  const isAbort =
    /AbortError/i.test(text) && /The user aborted a request/i.test(text);

  if (isAbort) {
    return {
      kind: 'timeout-reported-as-abort',
      ok: true,
      knownBug: true,
      message: text,
      hint: `midnight-js 4.1.1 reports AbortSignal.timeout as "The user aborted a request." (servicedesk#243). Default timeout is ${timeoutMs} ms (DEFAULT_TIMEOUT). Raise timeout on httpClientProofProvider for cold starts, or wait for midnight-js#1459 which will say "timed out after N ms".`,
      upstream: UPSTREAM_PROOF_PROVIDER_DROP,
      fix: MIDNIGHT_JS_FIX,
      official: OFFICIAL_DEFAULT_TIMEOUT,
      pins: LAB_PINS,
      credit: CREDIT,
    };
  }

  const bodyHit = PROOF_BODY_HINTS.find((h) => text.toLowerCase().includes(h.needle.toLowerCase()));
  if (bodyHit) {
    return {
      kind: 'body-present',
      ok: true,
      knownBug: false,
      proofServerKind: bodyHit.kind,
      message: text,
      hint: bodyHit.hint,
      upstream: UPSTREAM_PROOF_PROVIDER_DROP,
      official: OFFICIAL_PROOF_ERRORS,
      pins: LAB_PINS,
      credit: CREDIT,
    };
  }

  const statusOnly =
    /Failed Proof Server response/i.test(text) &&
    /code=["']?\d+/i.test(text) &&
    !PROOF_BODY_HINTS.some((h) => text.toLowerCase().includes(h.needle.toLowerCase()));

  if (statusOnly) {
    return {
      kind: 'status-only-body-dropped',
      ok: true,
      knownBug: true,
      message: text,
      hint: 'Proof provider returned only URL/status/statusText (servicedesk#243). The proof-server response body was not read. Check the proof-server log for the reason (e.g. bad input, Job Queue full). Fix tracked in midnight-js#1459.',
      upstream: UPSTREAM_PROOF_PROVIDER_DROP,
      fix: MIDNIGHT_JS_FIX,
      official: OFFICIAL_LOCAL_PROVING,
      pins: LAB_PINS,
      credit: CREDIT,
    };
  }

  if (/request to .+ failed/i.test(text) || /ECONNREFUSED/i.test(text)) {
    return {
      kind: 'connection-refused',
      ok: true,
      knownBug: false,
      message: text,
      hint: 'Nothing is listening at the proof-server address. Start midnightntwrk/proof-server:8.1.0 (lab pin) on port 6300.',
      upstream: UPSTREAM_PROOF_PROVIDER_DROP,
      official: OFFICIAL_LOCAL_PROVING,
      pins: LAB_PINS,
      credit: CREDIT,
    };
  }

  return {
    kind: 'unrecognized',
    ok: false,
    knownBug: false,
    message: text || null,
    hint: 'Not a recognized proof-provider symptom from servicedesk#243. See the proof-server error reference.',
    upstream: UPSTREAM_PROOF_PROVIDER_DROP,
    official: OFFICIAL_PROOF_ERRORS,
    pins: LAB_PINS,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const abort = decodeProofProviderError(
    Object.assign(new Error('The user aborted a request.'), { name: 'AbortError' }),
  );
  const statusOnly = decodeProofProviderError(
    'Failed Proof Server response: url="http://127.0.0.1:6300/check", code="400", status="Bad Request"',
  );
  const body = decodeProofProviderError('bad input: could not find key');
  const ok =
    abort.kind === 'timeout-reported-as-abort' &&
    abort.knownBug &&
    statusOnly.kind === 'status-only-body-dropped' &&
    body.kind === 'body-present';
  if (!ok) {
    console.error(JSON.stringify({ abort, statusOnly, body }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, kinds: [abort.kind, statusOnly.kind, body.kind], credit: CREDIT }, null, 2));
}
