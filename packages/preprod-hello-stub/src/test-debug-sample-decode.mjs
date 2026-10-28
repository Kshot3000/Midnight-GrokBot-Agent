/**
 * Classify pasted errors that match the outdated test-and-debug samples.
 * Upstream: midnightntwrk/midnight-docs#1487
 * Official: https://docs.midnight.network/compact/test-and-debug
 *           https://docs.midnight.network/guides/compact-javascript-runtime
 *           https://docs.midnight.network/relnotes/support-matrix
 *
 * Does not invent APIs, does not call a node or indexer, and does not claim a fix.
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const PATTERNS = [
  {
    id: 'hand-built-context',
    re: /privateState\s*,\s*ledgerState|expected value of type CircuitContext/i,
    hint: 'Use createConstructorContext / createCircuitContext from @midnight-ntwrk/compact-runtime (see JS guide).',
  },
  {
    id: 'newLedgerState',
    re: /newLedgerState|newContext/i,
    hint: 'Circuit call returns result, context, proofData, gasCost. Read ledger via ledger(call.context.currentQueryContext.state).',
  },
  {
    id: 'tx-wait',
    re: /tx\.wait\(|APPLIED_TO_CHAIN|receipt\.found/i,
    hint: 'midnight-js 4.1.1 callTx already resolves finalized. Statuses: SucceedEntirely, FailFallible, FailEntirely.',
  },
  {
    id: 'bboard-assert-text',
    re: /Board is occupied|Board is vacant|Not authorized/i,
    hint: 'Bulletin board messages differ from the test-and-debug samples; check the contract source.',
  },
];

export function decodeTestDebugSampleError(text) {
  if (typeof text !== 'string' || !text.trim()) {
    return { matched: false, hits: [] };
  }
  const hits = PATTERNS.filter((p) => p.re.test(text)).map(({ id, hint }) => ({ id, hint }));
  return { matched: hits.length > 0, hits };
}

export { PATTERNS };
