/**
 * Classify samples from the official Test and debug page that do not run
 * as written against the Compact JavaScript runtime guide.
 *
 * Does not invent midnight-js or compact-runtime methods.
 * Does not claim a public docs or indexer fix.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1487
 * Broken samples: https://docs.midnight.network/compact/test-and-debug
 * Working context shape: https://docs.midnight.network/guides/compact-javascript-runtime
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1487';
export const BROKEN_PAGE = 'https://docs.midnight.network/compact/test-and-debug';
export const RUNTIME_GUIDE = 'https://docs.midnight.network/guides/compact-javascript-runtime';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * Hand-built `{ privateState, ledgerState }` objects are what the test page
 * passes to impureCircuits. The runtime guide says wrappers check for
 * currentQueryContext and reject that shape.
 */
export function inspectCircuitContext(context) {
  const failures = [];
  if (context == null || typeof context !== 'object') {
    failures.push('context is missing; impure circuits take a CircuitContext first');
    return { ok: false, failures, upstream: UPSTREAM, docs: RUNTIME_GUIDE };
  }
  if (!Object.prototype.hasOwnProperty.call(context, 'currentQueryContext')) {
    failures.push(
      'hand-built context has no currentQueryContext; createCircuitContext is required',
    );
  }
  if (Object.prototype.hasOwnProperty.call(context, 'ledgerState')
    && !Object.prototype.hasOwnProperty.call(context, 'currentQueryContext')) {
    failures.push('ledgerState is not a CircuitContext field on the runtime guide');
  }
  return {
    ok: failures.length === 0,
    failures,
    upstream: UPSTREAM,
    docs: RUNTIME_GUIDE,
  };
}

/**
 * CircuitResults fields documented by the runtime guide: result, context,
 * proofData, gasCost. The test page reads newLedgerState and newContext.
 */
export function inspectCircuitResults(call) {
  const failures = [];
  if (call == null || typeof call !== 'object') {
    failures.push('circuit call returned nothing to inspect');
    return { ok: false, failures, upstream: UPSTREAM, docs: RUNTIME_GUIDE };
  }
  for (const field of ['result', 'context', 'proofData', 'gasCost']) {
    if (!Object.prototype.hasOwnProperty.call(call, field)) {
      failures.push(`CircuitResults is missing documented field ${field}`);
    }
  }
  if (Object.prototype.hasOwnProperty.call(call, 'newLedgerState')) {
    failures.push('newLedgerState is not a documented CircuitResults field');
  }
  if (Object.prototype.hasOwnProperty.call(call, 'newContext')) {
    failures.push('newContext is not a documented CircuitResults field; use context');
  }
  return {
    ok: failures.length === 0,
    failures,
    upstream: UPSTREAM,
    docs: RUNTIME_GUIDE,
  };
}

/**
 * Static checks for the published test-and-debug snippets. Does not compile
 * Compact and does not call a node.
 */
export function inspectTestDebugSample(source) {
  const text = String(source || '');
  const failures = [];
  if (/ledgerState\s*:/.test(text) && /impureCircuits\./.test(text)) {
    failures.push('sample builds a hand-written ledgerState context');
  }
  if (/newLedgerState/.test(text)) {
    failures.push('sample reads newLedgerState; runtime guide returns context');
  }
  if (/newContext/.test(text)) {
    failures.push('sample reads newContext; runtime guide returns context');
  }
  if (/const\s*=/.test(text)) {
    failures.push('sample has a syntax error: const= with no binding name');
  }
  if (/tx\.wait\s*\(/.test(text) || /APPLIED_TO_CHAIN/.test(text)) {
    failures.push(
      'finalization sample uses tx.wait and APPLIED_TO_CHAIN, which the runtime guide does not document',
    );
  }
  if (/toThrow\(\s*['"]Not authorized['"]/.test(text) || /toThrow\(\s*['"]Board is vacant['"]/.test(text)) {
    failures.push(
      'assert string Board is vacant or Not authorized does not match the runtime guide quote for takeDown',
    );
  }
  return {
    ok: failures.length === 0,
    failures,
    upstream: UPSTREAM,
    brokenPage: BROKEN_PAGE,
    docs: RUNTIME_GUIDE,
    credit: CREDIT,
  };
}

export const builderCredit = CREDIT;
