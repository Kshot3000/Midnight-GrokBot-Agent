/**
 * Classify a pasted DApp Connector snippet against the 4.0.1 surface.
 * Does not call a wallet, submit a transaction, or touch a node or indexer.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1569
 * Connector API 4.0.1:
 *   https://docs.midnight.network/api-reference/dapp-connector
 * Configuration (proverServerUri deprecated):
 *   https://docs.midnight.network/api-reference/dapp-connector/type-aliases/Configuration
 * Midnight.js network IDs:
 *   https://docs.midnight.network/sdks/official/midnight-js
 * Wallet-defined network ids (only mainnet is standard):
 *   https://docs.midnight.network/sdks/community/wallets/community-wallets-integration
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1569';
export const CONNECTOR =
  'https://docs.midnight.network/api-reference/dapp-connector';
export const CONFIGURATION =
  'https://docs.midnight.network/api-reference/dapp-connector/type-aliases/Configuration';
export const MIDNIGHT_JS_NETWORKS =
  'https://docs.midnight.network/sdks/official/midnight-js';
export const INTEGRATION =
  'https://docs.midnight.network/sdks/community/wallets/community-wallets-integration';

/** Midnight.js network IDs named by the official SDK page. Not invented. */
export const MIDNIGHT_JS_NETWORK_IDS = ['mainnet', 'preview', 'preprod', 'undeployed'];

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {string} sample
 */
export function decodeWalletConnectorStaleSample(sample) {
  const text = typeof sample === 'string' ? sample : '';
  const submitWithOptions = /submitTransaction\s*\([^)]*,\s*\{/.test(text);
  const payFeesOnSubmit = /submitTransaction[\s\S]{0,80}payFees/.test(text);
  const capitalizedNetwork = /['"](Preview|PreProd|Preprod|Undeployed)['"]/.test(text);
  const lowercaseNetwork = /['"](preview|preprod|undeployed|mainnet)['"]/.test(text);
  const noApiVersionFilter =
    /selectWallet\s*\(/.test(text) && !/apiVersion/.test(text);
  const proverServerUri = /proverServerUri/.test(text);
  const getProvingProvider = /getProvingProvider/.test(text);
  const stale =
    submitWithOptions ||
    payFeesOnSubmit ||
    capitalizedNetwork ||
    noApiVersionFilter ||
    (proverServerUri && !getProvingProvider);

  if (!text.trim()) {
    return {
      ok: false,
      classification: 'incomplete',
      title: 'wallet connector sample empty',
      hint: 'Pass the published snippet. This helper does not call a wallet.',
      upstream: UPSTREAM,
      docs: CONNECTOR,
      credit: CREDIT,
    };
  }

  if (stale) {
    return {
      ok: true,
      classification: 'stale-connector-sample',
      submitWithOptions,
      payFeesOnSubmit,
      capitalizedNetwork,
      noApiVersionFilter,
      proverServerUriDeprecated: proverServerUri && !getProvingProvider,
      midnightJsNetworkIds: MIDNIGHT_JS_NETWORK_IDS,
      title: 'Published wallet/connector sample does not match DApp Connector 4.0.1',
      hint:
        'In 4.0.1, submitTransaction takes only the transaction; payFees is on makeTransfer, makeIntent, and the two balance methods. Midnight.js network IDs are mainnet, preview, preprod, and undeployed. Only mainnet is fixed by the connector spec; other ids are wallet-defined (the CLI uses capitalized forms). A selectWallet helper must filter on apiVersion. Configuration.proverServerUri is optional and deprecated in favor of getProvingProvider. This decode does not fix the public pages, indexer, or node.',
      upstream: UPSTREAM,
      docs: CONNECTOR,
      configuration: CONFIGURATION,
      midnightJsNetworks: MIDNIGHT_JS_NETWORKS,
      integration: INTEGRATION,
      claim: 'sample classification only — not a wallet, indexer, or node fix',
      credit: CREDIT,
    };
  }

  if (lowercaseNetwork && /submitTransaction\s*\(/.test(text) && !submitWithOptions) {
    return {
      ok: true,
      classification: 'aligned-connector-sample',
      title: 'Snippet uses a documented network id and a single-argument submitTransaction',
      hint: 'Still confirm apiVersion filtering and that proverServerUri is not the proving path. This helper does not connect.',
      upstream: UPSTREAM,
      docs: CONNECTOR,
      credit: CREDIT,
    };
  }

  return {
    ok: false,
    classification: 'unrecognized',
    title: 'Snippet is not a recorded connector mismatch',
    hint: 'Look for capitalized network ids, submitTransaction with an options object, a selectWallet that ignores apiVersion, or proverServerUri without getProvingProvider.',
    upstream: UPSTREAM,
    docs: CONNECTOR,
    credit: CREDIT,
  };
}

export const walletConnectorStaleCredit = CREDIT;
