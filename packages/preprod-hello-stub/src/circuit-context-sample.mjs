/**
 * Flag unit-test samples that still use the hand-built context from
 * docs.midnight.network/compact/test-and-debug.
 * Does not call Compact, midnight-js, or a proof server. Does not invent APIs.
 * Official shape: https://docs.midnight.network/guides/compact-javascript-runtime
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1487
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_CIRCUIT_CONTEXT =
  'https://github.com/midnightntwrk/midnight-docs/issues/1487';
export const OFFICIAL_CIRCUIT_CONTEXT =
  'https://docs.midnight.network/guides/compact-javascript-runtime';
export const STALE_TEST_PAGE = 'https://docs.midnight.network/compact/test-and-debug';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/** Result keys documented on the JavaScript runtime guide. */
export const CIRCUIT_RESULT_KEYS = ['result', 'context', 'proofData', 'gasCost'];

/**
 * Assert strings from the bulletin-board suite on the JavaScript runtime guide.
 * The test-and-debug page still expects the shorter strings.
 */
export const OFFICIAL_ASSERT_MESSAGES = {
  occupied: 'Attempted to post to an occupied board',
  vacant: 'Attempted to take down post from an empty board',
  notOwner: 'Attempted to take down post, but not the current owner',
};

const STALE_ASSERTS = [
  ['Board is occupied', OFFICIAL_ASSERT_MESSAGES.occupied],
  ['Board is vacant', OFFICIAL_ASSERT_MESSAGES.vacant],
  ['Not authorized', OFFICIAL_ASSERT_MESSAGES.notOwner],
];

function stripComments(source) {
  return String(source || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

/**
 * @param {string} source JavaScript or TypeScript unit-test sample
 * @returns {{ok: boolean, failures: string[], hints: string[], upstream: string, official: string, credit: string}}
 */
export function checkCircuitContextSample(source) {
  const code = stripComments(source);
  const failures = [];
  const hints = [];

  const handBuilt =
    /privateState\s*,\s*ledgerState/.test(code) ||
    /ledgerState\s*,\s*privateState/.test(code);
  if (handBuilt) {
    failures.push(
      'hand-built { privateState, ledgerState } is not a CircuitContext; the generated wrapper expects query-context state',
    );
    hints.push(
      'build context with createConstructorContext then createCircuitContext (compact-runtime 0.16.0)',
    );
  }

  if (/\bnewLedgerState\b/.test(code) || /\bnewContext\b/.test(code)) {
    failures.push(
      'impure circuit calls return result, context, proofData, and gasCost, not newLedgerState or newContext',
    );
  }

  for (const [stale, official] of STALE_ASSERTS) {
    if (code.includes(stale)) {
      failures.push(`assert text "${stale}" does not match the contract; use "${official}"`);
    }
  }

  const usesRuntimeHelpers =
    /createConstructorContext\s*\(/.test(code) && /createCircuitContext\s*\(/.test(code);
  const readsLedger =
    /ledger\s*\(\s*[^)]*currentQueryContext\.state\s*\)/.test(code);
  if (!handBuilt && usesRuntimeHelpers && !readsLedger && /impureCircuits\./.test(code)) {
    failures.push(
      'read ledger state with ledger(call.context.currentQueryContext.state), not a raw ledgerState bag',
    );
  }

  if (failures.length === 0 && !usesRuntimeHelpers && /impureCircuits\./.test(code)) {
    failures.push(
      'impure circuit sample must build a CircuitContext with createConstructorContext and createCircuitContext',
    );
  }

  return {
    ok: failures.length === 0,
    failures,
    hints,
    resultKeys: CIRCUIT_RESULT_KEYS,
    assertMessages: OFFICIAL_ASSERT_MESSAGES,
    pins: {
      compact: '0.31.1',
      language: '>= 0.23',
      compactRuntime: '0.16.0',
      midnightJs: '4.1.1',
    },
    upstream: UPSTREAM_CIRCUIT_CONTEXT,
    official: OFFICIAL_CIRCUIT_CONTEXT,
    stalePage: STALE_TEST_PAGE,
    credit: CREDIT,
  };
}

const sample = process.argv[2];
if (sample && import.meta.url === `file://${process.argv[1]}`) {
  const fs = await import('node:fs');
  const report = checkCircuitContextSample(fs.readFileSync(sample, 'utf8'));
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exitCode = 1;
}
