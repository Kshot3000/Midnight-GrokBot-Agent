/**
 * Decode the generic "Transaction submission error" that hides a node 1010
 * "Transaction would exhaust the block limits" reason.
 *
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/225
 * Official:
 *   https://docs.midnight.network/api-reference/error-reference/
 *   https://docs.midnight.network/relnotes/support-matrix
 *   https://docs.midnight.network/guides/deploy-and-operate
 *
 * midnight-js 4.1.1 submitTx (via wallet-sdk-capabilities 3.3.1) wraps the
 * node RPC rejection as Effect.mapError -> new SubmissionError({ message:
 * 'Transaction submission error', cause: err }). A non-Effect caller sees only
 * the outer message; the 1010 text is reachable only by unwrapping the FiberFailure
 * cause chain. This classifier looks for either the outer generic string or the
 * nested 1010 / "exhaust the block limits" text so a Preprod deploy that is too
 * heavy can be distinguished from other submission failures.
 *
 * Does not call a node, indexer, proof server, or wallet. Does not invent APIs.
 * Does not claim a fix of the public indexer or node.
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/225';
export const OFFICIAL_ERRORS = 'https://docs.midnight.network/api-reference/error-reference/';
export const OFFICIAL_MATRIX = 'https://docs.midnight.network/relnotes/support-matrix';
export const OFFICIAL_DEPLOY = 'https://docs.midnight.network/guides/deploy-and-operate';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

const GENERIC = /Transaction submission error/i;
const BLOCK_LIMITS = /exhaust the block limits|1010[\s:]*Invalid Transaction/i;
const CODE_1010 = /\b1010\b/;

function collectText(error, depth = 0, acc = []) {
  if (error == null || depth > 6) return acc;
  if (typeof error === 'string') {
    acc.push(error);
    return acc;
  }
  if (typeof error === 'object') {
    if (typeof error.message === 'string') acc.push(error.message);
    if (typeof error.data === 'string') acc.push(error.data);
    if (error.cause) collectText(error.cause, depth + 1, acc);
    // Effect FiberFailure sometimes stores the cause under a symbol-like key or nested failures.
    if (error.failures && Array.isArray(error.failures)) {
      for (const f of error.failures) collectText(f, depth + 1, acc);
    }
  }
  return acc;
}

/**
 * Classify a submission error (string or Error-like) for the block-limits 1010 case.
 * @param {unknown} error
 */
export function decodeBlockLimits1010(error) {
  const texts = collectText(error);
  const joined = texts.join(' | ');
  const hasGeneric = GENERIC.test(joined);
  const hasLimits = BLOCK_LIMITS.test(joined) || CODE_1010.test(joined);

  if (hasLimits) {
    return {
      kind: 'block-limits-1010',
      ok: true,
      genericOuter: hasGeneric,
      message: 'node rejected the transaction because it would exhaust the block limits (RPC 1010)',
      hint: hasGeneric
        ? 'The outer midnight-js / wallet-sdk message is the generic "Transaction submission error". The 1010 reason is present deeper in the cause chain. Reduce exported circuits or use batched deploy. See servicedesk#225.'
        : '1010 / block-limits text is visible. The transaction is too heavy for the current block limits.',
      upstream: UPSTREAM,
      official: OFFICIAL_ERRORS,
      credit: CREDIT,
    };
  }

  if (hasGeneric) {
    return {
      kind: 'generic-submission',
      ok: false,
      genericOuter: true,
      message: null,
      hint: 'Generic "Transaction submission error" with no 1010 / block-limits text visible in the message or shallow cause. Unwrap the Effect FiberFailure (wallet-sdk-capabilities) to reach the node reason. This lab does not call a node.',
      upstream: UPSTREAM,
      official: OFFICIAL_DEPLOY,
      credit: CREDIT,
    };
  }

  return {
    kind: 'unrecognized',
    ok: false,
    genericOuter: false,
    message: null,
    hint: 'Not a recognized submission error. Official error reference lists proof-server and node codes; 1010 block-limits is a node Invalid Transaction.',
    upstream: UPSTREAM,
    official: OFFICIAL_ERRORS,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const genericOnly = decodeBlockLimits1010({
    message: 'Transaction submission error',
    cause: undefined,
  });
  const nested = decodeBlockLimits1010({
    message: 'Transaction submission error',
    cause: {
      message: 'Transaction submission failed',
      cause: {
        message: '1010: Invalid Transaction: Transaction would exhaust the block limits',
        data: 'Transaction would exhaust the block limits',
      },
    },
  });
  const ok = !genericOnly.ok && genericOnly.kind === 'generic-submission' && nested.ok && nested.kind === 'block-limits-1010';
  if (!ok) {
    console.error(JSON.stringify({ genericOnly, nested }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, kind: nested.kind, credit: CREDIT }, null, 2));
}
