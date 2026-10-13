import { pathToFileURL } from 'node:url';

/**
 * Classify captured proof-server response bodies against the official error table.
 * Does not call a proof server, wallet, indexer, or node.
 * Does not claim to fix the public proof server, midnight-js, indexer, or node.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/243
 * Official: https://docs.midnight.network/api-reference/error-reference/proof-server-errors
 * Pins: midnight-js 4.1.1, proof-server 8.1.0, Compact ~0.31.1 / language ~0.23
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_BODY_REASON =
  'https://github.com/midnightntwrk/servicedesk/issues/243';
export const OFFICIAL_PROOF_SERVER_ERRORS =
  'https://docs.midnight.network/api-reference/error-reference/proof-server-errors';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * Map a captured body string (8.x or 9.x style) to the official WorkError / WorkerPoolError.
 * @param {string} body
 * @param {number} [status]
 */
export function classifyProofServerBody(body, status = 400) {
  const text = String(body || '').trim();
  const lower = text.toLowerCase();

  if (/job queue full|jobqueuefull/i.test(text)) {
    return {
      kind: 'JobQueueFull',
      official: 'WorkerPoolError.JobQueueFull',
      status,
      hint: 'Wait and retry; the server is under heavy load. Upstream: ' + UPSTREAM_BODY_REASON,
      upstream: UPSTREAM_BODY_REASON,
    };
  }

  if (/bad input/i.test(text)) {
    const reason = text.includes('`') ? text : 'bad input';
    return {
      kind: 'BadInput',
      official: 'WorkError.BadInput(String)',
      status,
      reason,
      hint: 'Proof request input data is invalid. Check ZKIR / keys / preimage. On 8.x the detailed reason is often only in DEBUG logs. Upstream: ' + UPSTREAM_BODY_REASON,
      upstream: UPSTREAM_BODY_REASON,
    };
  }

  if (/internal error/i.test(text)) {
    return {
      kind: 'InternalError',
      official: 'WorkError.InternalError(String)',
      status,
      hint: 'Internal proof generation error. Restart the proof server and retry. Upstream: ' + UPSTREAM_BODY_REASON,
      upstream: UPSTREAM_BODY_REASON,
    };
  }

  if (/channel closed|channelclosed/i.test(text)) {
    return {
      kind: 'ChannelClosed',
      official: 'WorkerPoolError.ChannelClosed',
      status: status || 500,
      hint: 'Internal work channel closed. Restart the proof server. Upstream: ' + UPSTREAM_BODY_REASON,
      upstream: UPSTREAM_BODY_REASON,
    };
  }

  return {
    kind: 'unknown-body',
    official: null,
    status,
    hint: 'Body does not match the common 8.x/9.x strings from servicedesk#243. See ' + OFFICIAL_PROOF_SERVER_ERRORS,
    upstream: UPSTREAM_BODY_REASON,
  };
}

function selfCheck() {
  const a = classifyProofServerBody('bad input');
  const b = classifyProofServerBody("bad input: `couldn't find built-in key increment`");
  const c = classifyProofServerBody('Job Queue full');
  const d = classifyProofServerBody('internal error');
  const e = classifyProofServerBody('something else');

  const ok =
    a.kind === 'BadInput' &&
    b.kind === 'BadInput' &&
    b.reason.includes('increment') &&
    c.kind === 'JobQueueFull' &&
    d.kind === 'InternalError' &&
    e.kind === 'unknown-body';

  console.log(ok ? 'PASS' : 'FAIL', a.kind, b.reason, c.kind, d.kind, e.kind);
  console.log(CREDIT);
  process.exit(ok ? 0 : 1);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  selfCheck();
}
