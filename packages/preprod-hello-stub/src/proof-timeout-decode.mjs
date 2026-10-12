/**
 * Classify the proof-provider timeout that is reported as an abort.
 * Does not call a proof server, wallet, indexer, or node.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/243
 * Official: https://docs.midnight.network/api-reference/error-reference/proof-server-errors
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_PROOF_TIMEOUT = 'https://github.com/midnightntwrk/servicedesk/issues/243';
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
    return `${error.name || ''}: ${error.message}${cause ? ' <- ' + cause : ''}`;
  }
  return String(error);
}

/**
 * @param {unknown} error
 * @param {{ timeoutMs?: number }} [hints]
 */
export function decodeProofTimeout(error, hints = {}) {
  const text = textOf(error);
  const isAbort =
    /AbortError/.test(text) &&
    /aborted a request/i.test(text) &&
    (/Proof Server request failed/.test(text) || /Failed Proof Server/.test(text) || true);

  if (isAbort) {
    const ms = hints.timeoutMs ? ` after ${hints.timeoutMs} ms` : '';
    return {
      kind: 'timeout-as-abort',
      hint: `Proof request timed out${ms} but was reported as an abort. See ${OFFICIAL_PROOF_ERRORS}. Upstream: ${UPSTREAM_PROOF_TIMEOUT}`,
      upstream: UPSTREAM_PROOF_TIMEOUT,
    };
  }

  return {
    kind: 'other',
    hint: 'Not the timeout-as-abort shape from servicedesk#243.',
    upstream: UPSTREAM_PROOF_TIMEOUT,
  };
}

function selfCheck() {
  const abortErr = new Error('The user aborted a request.');
  abortErr.name = 'AbortError';
  const wrapped = new Error('Proof Server request failed: url="http://127.0.0.1:6300/check"');
  wrapped.cause = abortErr;

  const a = decodeProofTimeout(abortErr, { timeoutMs: 1 });
  const b = decodeProofTimeout(wrapped, { timeoutMs: 300000 });
  const c = decodeProofTimeout(new Error('Failed Proof Server response: code="400"'));

  const ok = a.kind === 'timeout-as-abort' && b.kind === 'timeout-as-abort' && c.kind === 'other';
  console.log(ok ? 'PASS' : 'FAIL', a.kind, b.kind, c.kind);
  console.log(CREDIT);
  process.exit(ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  selfCheck();
}
