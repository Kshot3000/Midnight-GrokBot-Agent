/**
 * Classify proof-provider errors that drop the body or report a timeout as an abort.
 * Lab-only decoder. Does not call a proof server, wallet, indexer, or node.
 * Does not claim to fix midnight-js or the public proof server.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/243
 * Official: https://docs.midnight.network/api-reference/error-reference/proof-server-errors
 * Pins: midnight-js 4.1.1, proof-server 8.1.0, Compact ~0.31.1 / language ~0.23
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_PROOF_CLASSIFY =
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
 * Classify a proof-provider failure into timeout-as-abort, dropped-body, or other.
 * @param {unknown} error
 * @param {{ timeoutMs?: number, capturedBody?: string }} [hints]
 * @returns {{ kind: string, hint: string, upstream: string }}
 */
export function classifyProofError(error, hints = {}) {
  const text = textOf(error);
  const isAbort =
    /AbortError/.test(text) && /aborted a request/i.test(text);

  if (isAbort) {
    const ms = hints.timeoutMs != null ? ` after ${hints.timeoutMs} ms` : '';
    return {
      kind: 'timeout-as-abort',
      hint: `Proof request timed out${ms} but was reported as an abort (servicedesk#243). Check proof-server /ready and increase the client timeout. Official: ${OFFICIAL_PROOF_ERRORS}`,
      upstream: UPSTREAM_PROOF_CLASSIFY,
    };
  }

  const dropped =
    /Failed Proof Server response/.test(text) &&
    /code="4\d\d"/.test(text) &&
    !/body=/.test(text);

  if (dropped) {
    const bodyNote = hints.capturedBody
      ? ` Captured body: ${hints.capturedBody.slice(0, 200)}`
      : ' Body was dropped by midnight-js 4.1.1; enable MIDNIGHT_PROOF_SERVER_VERBOSE=true for the DEBUG reason.';
    return {
      kind: 'dropped-body',
      hint: `Proof server returned a non-2xx but the client omitted the body.${bodyNote} See servicedesk#243.`,
      upstream: UPSTREAM_PROOF_CLASSIFY,
    };
  }

  return {
    kind: 'other',
    hint: 'Not the timeout-as-abort or dropped-body shape from servicedesk#243.',
    upstream: UPSTREAM_PROOF_CLASSIFY,
  };
}

function selfCheck() {
  const abortErr = new Error('The user aborted a request.');
  abortErr.name = 'AbortError';
  const wrapped = new Error('Proof Server request failed: url="http://127.0.0.1:6300/check"');
  wrapped.cause = abortErr;
  const dropped = new Error('Failed Proof Server response: url="http://127.0.0.1:6300/check", code="400", status="Bad Request"');
  const other = new Error('something else');

  const a = classifyProofError(abortErr, { timeoutMs: 1 });
  const b = classifyProofError(wrapped, { timeoutMs: 300000 });
  const c = classifyProofError(dropped, { capturedBody: 'bad input' });
  const d = classifyProofError(other);

  const ok =
    a.kind === 'timeout-as-abort' &&
    b.kind === 'timeout-as-abort' &&
    c.kind === 'dropped-body' &&
    d.kind === 'other';
  console.log(ok ? 'PASS' : 'FAIL', a.kind, b.kind, c.kind, d.kind);
  console.log(CREDIT);
  process.exit(ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  selfCheck();
}
