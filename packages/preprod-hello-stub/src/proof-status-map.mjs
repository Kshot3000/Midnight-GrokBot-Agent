/**
 * Map the HTTP status code that midnight-js *does* include in proof-provider errors
 * onto the official proof-server error family for that status.
 * Does not call a proof server, wallet, indexer, or node.
 * Does not claim to fix the public proof server or midnight-js.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/243
 * Official: https://docs.midnight.network/api-reference/error-reference/proof-server-errors
 * Pins: midnight-js 4.1.1, proof-server 8.1.0, Compact ~0.31.1
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_PROOF_STATUS =
  'https://github.com/midnightntwrk/servicedesk/issues/243';
export const OFFICIAL_PROOF_ERRORS =
  'https://docs.midnight.network/api-reference/error-reference/proof-server-errors';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/** Status -> official family (from the proof-server errors page). Body is dropped by 4.1.1. */
export const STATUS_MAP = {
  400: {
    family: 'BadInput / JobNotPending',
    hint: 'Check transaction data and that ZKIR/keys are readable. Enable MIDNIGHT_PROOF_SERVER_VERBOSE=true for the concrete reason (servicedesk#243).',
  },
  428: {
    family: 'JobMissing',
    hint: 'Referenced job not found (invalid or expired id).',
  },
  429: {
    family: 'JobQueueFull',
    hint: 'Proof generation job queue is full. Wait and retry; reduce parallel requests.',
  },
  500: {
    family: 'InternalError / ChannelClosed / JoinError / CancelledUnexpectedly',
    hint: 'Internal proof-server error. Check logs and restart if it persists.',
  },
  503: {
    family: '/ready busy',
    hint: 'All workers occupied (GET /ready returned 503). Wait for current proofs.',
  },
};

/**
 * Extract code="NNN" from a midnight-js proof-provider error string and map it.
 * @param {unknown} error
 * @returns {{ code?: number, family?: string, hint: string, upstream: string }}
 */
export function decodeProofStatus(error) {
  const text =
    typeof error === 'string'
      ? error
      : error && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : String(error ?? '');

  const m = text.match(/code="(\d{3})"/);
  if (!m) {
    return {
      hint: 'No code="..." found in the proof-provider error. Upstream: ' + UPSTREAM_PROOF_STATUS,
      upstream: UPSTREAM_PROOF_STATUS,
    };
  }
  const code = Number(m[1]);
  const mapped = STATUS_MAP[code];
  if (!mapped) {
    return {
      code,
      hint: `Status ${code} is not in the official proof-server error table. See ${OFFICIAL_PROOF_ERRORS}.`,
      upstream: UPSTREAM_PROOF_STATUS,
    };
  }
  return {
    code,
    family: mapped.family,
    hint: `${mapped.hint} Body was dropped by midnight-js 4.1.1. Official: ${OFFICIAL_PROOF_ERRORS}`,
    upstream: UPSTREAM_PROOF_STATUS,
  };
}

function selfCheck() {
  const e400 = new Error(
    'Failed Proof Server response: url="http://127.0.0.1:6300/check", code="400", status="Bad Request"',
  );
  const e429 = 'Failed Proof Server response: code="429", status="Too Many Requests"';
  const a = decodeProofStatus(e400);
  const b = decodeProofStatus(e429);
  const c = decodeProofStatus(new Error('something else'));
  const ok =
    a.code === 400 &&
    a.family &&
    a.family.includes('BadInput') &&
    b.code === 429 &&
    b.family === 'JobQueueFull' &&
    !c.code;
  console.log(ok ? 'PASS' : 'FAIL', a.code, b.family, !!c.code);
  console.log(CREDIT);
  process.exit(ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  selfCheck();
}
