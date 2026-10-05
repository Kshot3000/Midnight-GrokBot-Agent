/**
 * Classify a missing Preprod shielded output as wallet-indexer tip lag
 * versus a public confirmation. Uses heights the caller already observed.
 * Does not query an indexer and does not fix the public indexer or node.
 *
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/230
 * Public Preprod indexer (docs): https://indexer.preprod.midnight.network/api/v4/graphql
 * https://docs.midnight.network/guides/networks-and-environments
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/230';
const DOCS = 'https://docs.midnight.network/guides/networks-and-environments';
const PUBLIC_PREPROD_INDEXER = 'https://indexer.preprod.midnight.network/api/v4/graphql';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function height(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

export function classifyIndexerTipLag(input = {}) {
  const publicTip = height(input.publicTip);
  const walletIndexerTip = height(input.walletIndexerTip ?? input.indexerTip);
  const publicIndexerTip = height(input.publicIndexerTip);
  const txBlock = height(input.txBlock);

  if (publicTip == null || walletIndexerTip == null) {
    return {
      ok: false,
      classification: 'incomplete',
      title: 'Indexer tip probe incomplete',
      hint: 'Need numeric publicTip and walletIndexerTip before judging lag. This helper does not call the indexer.',
      upstream: UPSTREAM,
      docs: DOCS,
      publicIndexer: PUBLIC_PREPROD_INDEXER,
    };
  }

  const walletLag = publicTip - walletIndexerTip;
  const txAheadOfWallet = txBlock != null && txBlock > walletIndexerTip;
  const publicHasTx = publicIndexerTip != null && txBlock != null && publicIndexerTip >= txBlock;
  const walletBehindPublicIndexer = publicIndexerTip != null && walletIndexerTip + 1 < publicIndexerTip;

  let classification = 'aligned';
  let title = 'Wallet indexer tip is not behind this sample';
  let hint = 'Wallet indexer tip is at or above the public tip in this sample. A missing output is not explained by tip lag.';

  if (txAheadOfWallet && publicHasTx) {
    classification = 'wallet-indexer-behind-public-confirmation';
    title = 'Wallet indexer tip is behind a publicly confirmed transaction';
    hint = `Transaction block ${txBlock} is above wallet indexer tip ${walletIndexerTip} and at or below public indexer tip ${publicIndexerTip}. The public Preprod indexer can already see it. This is wallet-indexer lag (servicedesk#230 reported api-preprod.1am.xyz), not a failed prove and not a fix of the public indexer.`;
  } else if (txAheadOfWallet) {
    classification = 'tx-above-wallet-indexer-tip';
    title = 'Transaction block is above the wallet indexer tip';
    hint = `Transaction block ${txBlock} is ${txBlock - walletIndexerTip} blocks above wallet indexer tip ${walletIndexerTip}. Do not treat a missing shielded output as a contract failure until this indexer catches up. This lab does not fix that indexer.`;
  } else if (walletLag > 0 || walletBehindPublicIndexer) {
    classification = 'wallet-indexer-behind-public-tip';
    title = 'Wallet indexer tip is behind the public chain tip';
    hint = `Wallet indexer tip ${walletIndexerTip} is ${walletLag} blocks behind public tip ${publicTip}. Compare with the documented public indexer ${PUBLIC_PREPROD_INDEXER} before blaming the contract. Not a public indexer or node fix.`;
  }

  return {
    ok: classification === 'aligned',
    classification,
    walletLagBlocks: walletLag,
    txAheadOfWallet,
    publicHasTx,
    title,
    hint,
    upstream: UPSTREAM,
    docs: DOCS,
    publicIndexer: PUBLIC_PREPROD_INDEXER,
  };
}

export const indexerTipLagCredit = CREDIT;
