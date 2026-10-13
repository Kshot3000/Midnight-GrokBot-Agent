/**
 * Unified decoder for midnight-js proof provider errors that drop the body
 * or report a timeout as an abort. Does not call a proof server, wallet,
 * indexer, or node. Does not claim to fix the public proof server or midnight-js.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/243
 * Official: https://docs.midnight.network/api-reference/error-reference/proof-server-errors
 * Pins: midnight-js 4.1.1, proof-server 8.1.0, Compact ~0.31.1 / language ~0.23
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

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

function textOf(error) {
  if (error == null) return '';
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && typeof error.message === 'string') {
    const cause = error.cause ? textOf(error.cause) : '';
    return `${error.name || 'Error'}: ${error.message}${cause ? ' <- ' + cause : ''}`;
  }
  return String(error);
}

/**
 * Classify a proof-provider error from midnight-js 4.1.1.
 * @param {unknown} error
 * @param {{ timeoutMs?: number, body?: string }} [hints]
 */
export function decodeProofProviderError(error, hints = {}) {
  const text = textOf(error);
  const body = typeof hints.body === 'string' ? hints.body : '';

  // Timeout reported as abort (servicedesk#243)
  if (/AbortError/.test(text) && /aborted a request/i.test(text)) {
    const ms = hints.timeoutMs != null ? ` after ${hints.timeoutMs} ms` : '';
    return {
      kind: 'timeout-as-abort',
      official: 'timeout',
      hint: `Proof Server request timed out${ms} but was reported as AbortError. Upstream: ${UPSTREAM_PROOF_PROVIDER}. See ${OFFICIAL_PROOF_ERRORS}.`,
      upstream: UPSTREAM_PROOF_PROVIDER,
    };
  }

  // Body dropped on non-2xx (servicedesk#243)
  if (/Failed Proof Server response/.test(text) && /code="400"/.test(text)) {
    let reason = 'body dropped by midnight-js 4.1.1';
    if (body) {
      if (/bad input/i.test(body)) {
        reason = body.includes('`') ? body : 'bad input (specific reason may be in verbose logs)';
      } else if (/Job Queue full|JobQueueFull/i.test(body)) {
        reason = 'JobQueueFull';
      }
    }
    return {
      kind: 'body-dropped',
      official: 'BadInput or other 400',
      reason,
      hint: `Response body was not included in the error. On 8.x it is often "bad input"; on 9.x it carries the reason. Enable MIDNIGHT_PROOF_SERVER_VERBOSE=true. Upstream: ${UPSTREAM_PROOF_PROVIDER}. Official: ${OFFICIAL_PROOF_ERRORS}.`,
      upstream: UPSTREAM_PROOF_PROVIDER,
    };
  }

  return {
    kind: 'other',
    hint: 'Not a known body-drop or timeout-as-abort shape from servicedesk#243.',
    upstream: UPSTREAM_PROOF_PROVIDER,
  };
}

function selfCheck() {
  const abort = Object.assign(new Error('The user aborted a request.'), { name: 'AbortError' });
  const failed400 = new Error('Failed Proof Server response: url="http://127.0.0.1:6300/check", code="400", status="Bad Request"');
  const other = new Error('something else');

  const a = decodeProofProviderError(abort, { timeoutMs: 1 });
  const b = decodeProofProviderError(failed400, { body: 'bad input' });
  const c = decodeProofProviderError(failed400, { body: "bad input: `couldn't find built-in key increment`" });
  const d = decodeProofProviderError(other);

  const ok =
    a.kind === 'timeout-as-abort' &&
    b.kind === 'body-dropped' &&
    c.kind === 'body-dropped' &&
    c.reason.includes('increment') &&
    d.kind === 'other';

  console.log(ok ? 'PASS' : 'FAIL', a.kind, b.kind, c.reason, d.kind);
  console.log(CREDIT);
  process.exit(ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  selfCheck();
}
