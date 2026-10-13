/**
 * Record the mismatches between the test-and-debug page samples and the working pattern.
 * Does not compile Compact, call a proof server, wallet, indexer, or node.
 * Does not claim to fix the public docs.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1487
 * Official: https://docs.midnight.network/compact/test-and-debug
 *            https://docs.midnight.network/guides/compact-javascript-runtime
 * Pins: Compact ~0.31.1 / language ~0.23, compact-runtime 0.16.0, midnight-js 4.1.1
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM =
  'https://github.com/midnightntwrk/midnight-docs/issues/1487';
export const OFFICIAL_TEST =
  'https://docs.midnight.network/compact/test-and-debug';
export const OFFICIAL_JS =
  'https://docs.midnight.network/guides/compact-javascript-runtime';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * Known sample defects from the test-and-debug page (issue #1487).
 */
export const SAMPLE_DEFECTS = [
  {
    id: 'hand-built-context',
    page: OFFICIAL_TEST,
    defect: 'Passes { privateState, ledgerState } as CircuitContext; generated code rejects it.',
    fix: 'Use RT.createConstructorContext and RT.createCircuitContext.',
  },
  {
    id: 'result-shape',
    page: OFFICIAL_TEST,
    defect: 'Reads newLedgerState / newContext; call returns result, context, proofData, gasCost.',
    fix: 'Read call.context.currentQueryContext.state via ledger().',
  },
  {
    id: 'assert-messages',
    page: OFFICIAL_TEST,
    defect: 'Expects "Board is occupied" / "Board is vacant" / "Not authorized".',
    fix: 'Use the bulletin-board messages from the JS runtime guide.',
  },
  {
    id: 'tx-wait',
    page: OFFICIAL_TEST,
    defect: 'Calls tx.wait() and expects APPLIED_TO_CHAIN / receipt.found.',
    fix: 'callTx already resolves with the finalized transaction.',
  },
];

export function classifySampleDefects() {
  return {
    ok: SAMPLE_DEFECTS.length === 4,
    count: SAMPLE_DEFECTS.length,
    defects: SAMPLE_DEFECTS,
    upstream: UPSTREAM,
    official: OFFICIAL_JS,
    credit: CREDIT,
  };
}

function selfCheck() {
  const r = classifySampleDefects();
  const ok = r.ok && r.defects.every((d) => d.defect && d.fix);
  console.log(ok ? 'PASS' : 'FAIL', r.count);
  console.log(CREDIT);
  process.exit(ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  selfCheck();
}
