/**
 * Classify a hang at WalletFacade balance/finalization before submit.
 * Does not call the wallet SDK, does not sample process RSS, and does not
 * fix the public indexer or node.
 *
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/194
 * Official: https://docs.midnight.network/sdks/official/wallet-developer-guide
 * Official: https://docs.midnight.network/api-reference/wallet-sdk
 * Official: https://docs.midnight.network/api-reference/midnight-js
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const builderCredit = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

export const WALLET_BALANCE_STALL_DOCS = {
  upstream: 'https://github.com/midnightntwrk/servicedesk/issues/194',
  walletGuide: 'https://docs.midnight.network/sdks/official/wallet-developer-guide',
  walletSdk: 'https://docs.midnight.network/api-reference/wallet-sdk',
  midnightJs: 'https://docs.midnight.network/api-reference/midnight-js',
  enterMarker: 'wallet-balance/finalization-enter',
  publishedCalls: [
    'balanceUnprovenTransaction',
    'balanceFinalizedTransaction',
    'finalizeRecipe',
    'submitTransaction',
  ],
};

function textOf(input) {
  if (input == null) return '';
  if (typeof input === 'string') return input;
  const parts = [input.message, input.name, input.stack, input.marker];
  if (input.cause) parts.push(textOf(input.cause));
  return parts.filter(Boolean).join('\n');
}

function result(kind, hint) {
  return {
    kind,
    hint,
    upstream: WALLET_BALANCE_STALL_DOCS.upstream,
    docs: WALLET_BALANCE_STALL_DOCS.walletGuide,
    credit: builderCredit,
  };
}

/**
 * Map a log onto servicedesk#194. A node rejection or indexer stall is a
 * different class: those return. This hang does not reach submitTransaction.
 * @param {unknown} input
 */
export function classifyWalletBalanceStall(input) {
  const text = textOf(input);
  if (!text.trim()) {
    return result('empty', 'No balance/finalization symptom text to classify.');
  }

  if (/1010|exhaust the block limits|Transaction submission error/i.test(text)) {
    return result(
      'reached-submit',
      'A submission error means submitTransaction was reached. servicedesk#194 stops at wallet-balance/finalization-enter and never submits. Decode 1010 with the submission helper; this is not that hang.',
    );
  }

  if (/indexer|503|tip lag|event id/i.test(text) && !/finalization-enter/i.test(text)) {
    return result(
      'not-a-wallet-balance-stall',
      'Indexer symptoms are not the WalletFacade balance/finalization hang. This helper does not claim an indexer or node fix.',
    );
  }

  if (/wallet-balance\/finalization-enter/i.test(text)) {
    return result(
      'balance-finalization-enter',
      'Last published marker on servicedesk#194. Proof generation already finished; submitTransaction was not called. The wallet guide documents balanceUnprovenTransaction, balanceFinalizedTransaction, finalizeRecipe, then submitTransaction. A hang on the enter marker is not an RPC rejection.',
    );
  }

  if (/balanceFinalizedTransaction|balanceUnprovenTransaction|finalizeRecipe/i.test(text) && /never return|does not return|watchdog|CPU-bound|pins CPU/i.test(text)) {
    return result(
      'balance-call-did-not-return',
      'The wallet guide publishes those balance and finalize calls. Issue 194 records the call not returning, with the operator process CPU-bound, before submission. This lab does not sample RSS and does not patch wallet-sdk.',
    );
  }

  if (/1\.74\s*GiB|RSS grows|resident memory/i.test(text) && /balance|finalization/i.test(text)) {
    return result(
      'rss-growth-before-submit',
      'Issue 194 attributes operator RSS growth to the balance/finalization boundary, before the node sees the transaction. Do not treat that growth as a public indexer or node fault.',
    );
  }

  return result(
    'not-a-recorded-balance-stall',
    'Text does not match the pre-submit WalletFacade stall recorded on servicedesk#194.',
  );
}
