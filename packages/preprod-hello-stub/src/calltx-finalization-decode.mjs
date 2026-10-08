/**
 * Decode the outdated callTx finalization sample on the test-and-debug page.
 * Does not submit a transaction and does not call a node or indexer.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1487
 * Broken sample (tx.wait, APPLIED_TO_CHAIN, receipt.found):
 *   https://docs.midnight.network/compact/test-and-debug
 * callTx path already returns finalized data:
 *   https://docs.midnight.network/api-reference/midnight-js/@midnight-ntwrk/midnight-js-contracts/functions/submitCallTx
 * Async path watches, then compares status to SucceedEntirely:
 *   https://docs.midnight.network/api-reference/midnight-js/@midnight-ntwrk/midnight-js-contracts/functions/submitCallTxAsync
 * TxStatus values:
 *   https://docs.midnight.network/api-reference/midnight-js/@midnight-ntwrk/midnight-js-types/type-aliases/TxStatus
 * SucceedEntirely:
 *   https://docs.midnight.network/api-reference/midnight-js/@midnight-ntwrk/midnight-js-types/variables/SucceedEntirely
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1487';
export const BROKEN_PAGE = 'https://docs.midnight.network/compact/test-and-debug';
export const SUBMIT_CALL_TX =
  'https://docs.midnight.network/api-reference/midnight-js/@midnight-ntwrk/midnight-js-contracts/functions/submitCallTx';
export const SUBMIT_CALL_TX_ASYNC =
  'https://docs.midnight.network/api-reference/midnight-js/@midnight-ntwrk/midnight-js-contracts/functions/submitCallTxAsync';
export const TX_STATUS =
  'https://docs.midnight.network/api-reference/midnight-js/@midnight-ntwrk/midnight-js-types/type-aliases/TxStatus';

/** Status strings named by the midnight-js TxStatus alias. Not invented. */
export const TX_STATUSES = ['SucceedEntirely', 'FailFallible', 'FailEntirely'];

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {string} sample
 */
export function decodeCallTxFinalizationSample(sample) {
  const text = typeof sample === 'string' ? sample : '';
  const waits = /\btx\.wait\s*\(/.test(text);
  const applied = /APPLIED_TO_CHAIN/.test(text);
  const receiptFound = /receipt\.found/.test(text);
  const usesCallTx = /callTx\./.test(text);
  const outdated = waits || applied || receiptFound;

  if (!text.trim()) {
    return {
      ok: false,
      classification: 'incomplete',
      title: 'callTx finalization sample empty',
      hint: 'Pass the published snippet. This helper does not call a node.',
      upstream: UPSTREAM,
      docs: BROKEN_PAGE,
      credit: CREDIT,
    };
  }

  if (outdated) {
    return {
      ok: true,
      classification: 'outdated-finalization-sample',
      waits,
      appliedToChain: applied,
      receiptFound,
      usesCallTx,
      statuses: TX_STATUSES,
      title: 'Test-and-debug finalization sample does not match midnight-js',
      hint:
        'submitCallTx already resolves to FinalizedCallTxData, so there is no tx.wait() on that return. submitCallTxAsync returns after submission; the documented follow-up is publicDataProvider.watchForTxData, then a status compare against SucceedEntirely. TxStatus is SucceedEntirely, FailFallible, or FailEntirely. APPLIED_TO_CHAIN and receipt.found are not on those pages. This decode does not fix the public indexer or node.',
      upstream: UPSTREAM,
      docs: BROKEN_PAGE,
      submitCallTx: SUBMIT_CALL_TX,
      submitCallTxAsync: SUBMIT_CALL_TX_ASYNC,
      txStatus: TX_STATUS,
      claim: 'sample classification only — not a node or indexer fix',
      credit: CREDIT,
    };
  }

  const named = TX_STATUSES.filter((status) => text.includes(status));
  if (named.length > 0 && !waits) {
    return {
      ok: true,
      classification: 'aligned-status-names',
      statuses: named,
      title: 'Sample names a documented TxStatus value',
      hint: 'Still confirm whether the call is submitCallTx (already finalized) or submitCallTxAsync (watchForTxData). This helper does not submit.',
      upstream: UPSTREAM,
      docs: TX_STATUS,
      credit: CREDIT,
    };
  }

  return {
    ok: false,
    classification: 'unrecognized',
    title: 'Snippet is not the recorded finalization mismatch',
    hint: 'Look for tx.wait(), APPLIED_TO_CHAIN, or receipt.found from the test-and-debug page.',
    upstream: UPSTREAM,
    docs: BROKEN_PAGE,
    credit: CREDIT,
  };
}

export const callTxFinalizationCredit = CREDIT;
