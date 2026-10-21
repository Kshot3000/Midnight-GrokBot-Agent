/**
 * Classify pasted snippets that match the stale lines reported in
 * midnightntwrk/midnight-docs#1569 against DApp Connector API 4.0.1.
 * Does not call a wallet, connector, indexer, or node.
 *
 * Official:
 *   https://docs.midnight.network/api-reference/dapp-connector/type-aliases/WalletConnectedAPI
 *   submitTransaction(tx) takes only the sealed transaction.
 *   balanceSealedTransaction / balanceUnsealedTransaction document optional payFees.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1569
 *
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1,
 * DApp Connector 4.0.1, proof-server 8.1.0.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1569';
export const TYPE_PAGE =
  'https://docs.midnight.network/api-reference/dapp-connector/type-aliases/WalletConnectedAPI';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {string} snippet
 */
export function decodeDappConnectorStale(snippet) {
  const text = typeof snippet === 'string' ? snippet : '';
  const payFeesOnSubmit = /submitTransaction\s*\([^)]*\{\s*payFees/.test(text);
  const capitalizedPreProd = /['"]PreProd['"]/.test(text);
  const capitalizedPreview = /['"]Preview['"]/.test(text);
  const capitalizedUndeployed = /['"]Undeployed['"]/.test(text);
  const lowercaseOk = /['"]preprod['"]|['"]preview['"]|['"]undeployed['"]|['"]mainnet['"]/.test(text);

  if (!text.trim()) {
    return {
      ok: false,
      classification: 'incomplete',
      title: 'snippet empty',
      hint: 'Pass a pasted line or sample. This helper does not call a wallet.',
      upstream: UPSTREAM,
      docs: TYPE_PAGE,
      credit: CREDIT,
    };
  }

  if (payFeesOnSubmit || capitalizedPreProd || capitalizedPreview || capitalizedUndeployed) {
    return {
      ok: true,
      classification: 'stale-pattern',
      payFeesOnSubmit,
      capitalizedNetworkId: capitalizedPreProd || capitalizedPreview || capitalizedUndeployed,
      title: 'Snippet matches a pattern called out by midnight-docs#1569',
      hint:
        'On the 4.0.1 WalletConnectedAPI type page, submitTransaction takes only the sealed tx. payFees is documented on balanceSealedTransaction, balanceUnsealedTransaction, and the transacting methods that build transactions. Network ID strings other than mainnet are wallet-defined; the issue records SDK IDs as preview / preprod / undeployed. This decode does not fix midnight-docs or any public service.',
      upstream: UPSTREAM,
      docs: TYPE_PAGE,
      claim: 'sample classification only — not a connector, indexer, or node fix',
      credit: CREDIT,
    };
  }

  if (lowercaseOk && !payFeesOnSubmit) {
    return {
      ok: true,
      classification: 'aligned-network-id',
      title: 'Snippet uses a lowercase network ID string',
      hint: 'Still confirm against the wallet you target. Only mainnet is fixed by the connector spec. This helper does not connect.',
      upstream: UPSTREAM,
      docs: TYPE_PAGE,
      credit: CREDIT,
    };
  }

  return {
    ok: false,
    classification: 'unrecognized',
    title: 'Snippet is not one of the recorded stale patterns',
    hint: 'Look for submitTransaction with a payFees object, or capitalized Preview / PreProd / Undeployed network ID strings.',
    upstream: UPSTREAM,
    docs: TYPE_PAGE,
    credit: CREDIT,
  };
}

export const dappConnectorStaleCredit = CREDIT;
