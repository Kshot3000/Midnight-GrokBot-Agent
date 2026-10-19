/**
 * Classifies stale lines on wallet and connector pages against DApp Connector 4.0.1.
 * Upstream: midnightntwrk/midnight-docs#1569
 * Official: https://docs.midnight.network/api-reference/dapp-connector
 * This file does not call a wallet, midnight-js, or the public indexer/node.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const CONNECTOR_API_VERSION = '4.0.1';

/** Network ids accepted on the published connector samples and midnight-js NetworkId. */
export const KNOWN_NETWORK_IDS = Object.freeze(['mainnet', 'preprod', 'preview', 'undeployed']);

/**
 * @param {string} id
 * @returns {{ok: boolean, normalized?: string, reason?: string}}
 */
export function checkNetworkId(id) {
  if (typeof id !== 'string' || !id) {
    return { ok: false, reason: 'networkId must be a non-empty string' };
  }
  const normalized = id.toLowerCase();
  if (KNOWN_NETWORK_IDS.includes(normalized)) {
    return { ok: true, normalized };
  }
  return { ok: false, reason: `unknown networkId "${id}"; use one of ${KNOWN_NETWORK_IDS.join(', ')}` };
}

/**
 * submitTransaction in 4.0.1 takes only the transaction.
 * @param {unknown[]} args
 * @returns {{ok: boolean, reason?: string}}
 */
export function checkSubmitTransactionArgs(args) {
  if (!Array.isArray(args) || args.length !== 1) {
    return { ok: false, reason: 'submitTransaction takes exactly one argument (the transaction); payFees is not a parameter' };
  }
  return { ok: true };
}

/**
 * DApps must filter on apiVersion before connect.
 * @param {string} apiVersion
 * @param {string} expected
 * @returns {{ok: boolean, reason?: string}}
 */
export function checkApiVersion(apiVersion, expected = CONNECTOR_API_VERSION) {
  if (typeof apiVersion !== 'string' || !apiVersion) {
    return { ok: false, reason: 'apiVersion missing; filter wallets before connect' };
  }
  // Exact pin for this lab. Real DApps should use semver range per the connector page.
  if (apiVersion === expected) {
    return { ok: true };
  }
  return { ok: false, reason: `apiVersion ${apiVersion} does not match pinned ${expected}` };
}

export function describeStaleLines() {
  return {
    upstream: 'https://github.com/midnightntwrk/midnight-docs/issues/1569',
    connector: 'https://docs.midnight.network/api-reference/dapp-connector',
    pinned: CONNECTOR_API_VERSION,
    points: [
      'submitTransaction(tx) only; no payFees',
      'network ids are lowercase (preprod, preview, undeployed, mainnet)',
      'balanceUnsealedTransaction vs balanceSealedTransaction are distinct',
      'filter on apiVersion with semver before connect',
      'proverServerUri is deprecated; prefer getProvingProvider()',
      'initSwap defaults payFees false; pass empty inputs object for a token kind to keep its outputs',
    ],
  };
}
