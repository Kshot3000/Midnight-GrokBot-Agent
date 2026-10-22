// Lab stub: official DApp Connector 4.0.1 method shape.
// Official: https://docs.midnight.network/api-reference/dapp-connector/type-aliases/WalletConnectedAPI
// Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1569
// Pins: DApp Connector 4.0.1. LOCAL-TRUE. No wallet calls.

/**
 * From WalletConnectedAPI (v4.0.1):
 * submitTransaction(tx: string): Promise<void>
 * payFees is not an argument of submitTransaction.
 */
export const SUBMIT_TRANSACTION_PARAMS = Object.freeze(['tx']);

/**
 * Methods that accept an optional (or required) payFees flag.
 * Official reference, DApp Connector API 4.0.1.
 */
export const METHODS_WITH_PAY_FEES = Object.freeze([
  'makeTransfer',
  'makeIntent',
  'balanceUnsealedTransaction',
  'balanceSealedTransaction',
]);

/**
 * Lowercase network ids used by the connector samples and SDK.
 * mainnet is the only id fixed by the spec; others are wallet-defined.
 */
export const CONNECTOR_NETWORK_IDS = Object.freeze([
  'mainnet',
  'preview',
  'preprod',
  'undeployed',
]);

export const PINNED_API_VERSION = '4.0.1';

/**
 * Pure filter: keep injected InitialAPI-like objects whose apiVersion
 * equals the pinned connector version. Does not touch window or a wallet.
 * @param {Array<{apiVersion?: string}>} wallets
 * @param {string} [wanted]
 * @returns {Array<{apiVersion?: string}>}
 */
export function filterByApiVersion(wallets, wanted = PINNED_API_VERSION) {
  if (!Array.isArray(wallets)) return [];
  return wallets.filter((w) => w && w.apiVersion === wanted);
}

/**
 * True when a call shape matches the official submitTransaction signature.
 * Rejects any options object or extra arguments (including payFees).
 * @param {unknown[]} args
 * @returns {boolean}
 */
export function isValidSubmitTransactionArgs(args) {
  return Array.isArray(args) && args.length === 1 && typeof args[0] === 'string';
}

// Built by @kshot9000 https://x.com/kshot9000
// Email: kshot9000@gmail.com
// Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
// Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
