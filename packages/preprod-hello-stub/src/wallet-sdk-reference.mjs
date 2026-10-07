/**
 * Classify "where is the Wallet SDK API reference?" against the published page.
 *
 * midnight-docs#831 (opened 2026-04-15) reported that
 * https://docs.midnight.network/api-reference had no Wallet SDK reference.
 * As of 2026-10-06 the index lists Wallet SDK and a narrative page exists at
 * https://docs.midnight.network/api-reference/wallet-sdk. The issue is still
 * open: it also asked whether a generated function index (the Midnight.js
 * style) should be produced by automation. This helper does not generate
 * that index, does not call WalletFacade, and does not claim the public
 * docs issue is closed.
 *
 * Published package names and calls below are copied from that page and the
 * compatibility matrix. No other methods are invented.
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

export const WALLET_SDK_REFERENCE = {
  upstream: 'https://github.com/midnightntwrk/midnight-docs/issues/831',
  apiIndex: 'https://docs.midnight.network/api-reference',
  walletPage: 'https://docs.midnight.network/api-reference/wallet-sdk',
  matrix: 'https://docs.midnight.network/relnotes/support-matrix',
  matrixPin: '1.2.0',
  midnightJsPin: '4.1.1',
  dappConnectorPin: '4.0.1',
  proofServerPin: '8.1.0',
};

/** Package names listed under Packages on the published Wallet SDK page. */
export const PUBLISHED_WALLET_PACKAGES = [
  '@midnight-ntwrk/wallet-sdk-facade',
  '@midnight-ntwrk/wallet-sdk-unshielded-wallet',
  '@midnight-ntwrk/wallet-sdk-shielded',
  '@midnight-ntwrk/wallet-sdk-dust-wallet',
  '@midnight-ntwrk/wallet-sdk-hd',
  '@midnight-ntwrk/wallet-sdk-address-format',
  '@midnight-ntwrk/wallet-sdk-node-client',
  '@midnight-ntwrk/wallet-sdk-indexer-client',
  '@midnight-ntwrk/wallet-sdk-prover-client',
];

/** Calls shown in the published page samples. Not a generated API index. */
export const PUBLISHED_SAMPLE_CALLS = [
  'WalletFacade.init',
  'WalletFacade.fetchTermsAndConditions',
  'wallet.acceptTermsAndConditions',
  'wallet.transferTransaction',
  'wallet.signRecipe',
  'wallet.finalizeRecipe',
];

function result(kind, hint) {
  return {
    kind,
    hint,
    upstream: WALLET_SDK_REFERENCE.upstream,
    docs: WALLET_SDK_REFERENCE.walletPage,
    matrixPin: WALLET_SDK_REFERENCE.matrixPin,
    generatedIndex: false,
    credit: builderCredit,
  };
}

/**
 * Map a builder question or import error onto the published Wallet SDK page.
 * @param {unknown} input
 */
export function classifyWalletSdkReferenceGap(input) {
  const text = String(input ?? '');
  const lower = text.toLowerCase();

  if (/wallet-sdk-facade|walletfacade\.init|fetchtermsandconditions/.test(lower)) {
    return result(
      'published-facade-sample',
      'The Wallet SDK page shows WalletFacade.init, fetchTermsAndConditions, and acceptTermsAndConditions from @midnight-ntwrk/wallet-sdk-facade. Compatibility matrix pins Wallet SDK 1.2.0. This is a narrative sample, not the generated function index midnight-docs#831 asked about.',
    );
  }

  if (/transfertransaction|signrecipe|finalizerecipe/.test(lower)) {
    return result(
      'published-transfer-sample',
      'The published Transfers section shows transferTransaction, then signRecipe, then finalizeRecipe. It imports ledger from @midnight-ntwrk/ledger-v8. Do not treat that sample as a complete method list.',
    );
  }

  if (/wallet-sdk-hd|hdwallet|address-format|bech32m/.test(lower)) {
    return result(
      'published-hd-or-address',
      'HD Wallet and Address Format sections name @midnight-ntwrk/wallet-sdk-hd (HDWallet, Roles) and @midnight-ntwrk/wallet-sdk-address-format. No extra derivation path is invented here.',
    );
  }

  if (/missing wallet sdk|wallet sdk api reference|api-reference\/wallet-sdk|no wallet sdk reference/.test(lower)) {
    return result(
      'page-now-published-index-still-open',
      'midnight-docs#831 said the API index had no Wallet SDK reference. The index now links Wallet SDK and https://docs.midnight.network/api-reference/wallet-sdk exists. The issue stays open on whether automation should emit a Midnight.js-style function index. This lab does not generate one.',
    );
  }

  if (/@midnight-ntwrk\/wallet-sdk["']|cannot find module ['"]@midnight-ntwrk\/wallet-sdk['"]/.test(text)) {
    return result(
      'barrel-not-on-the-page',
      'The published Packages table lists facade, unshielded, shielded, dust, hd, address-format, node-client, indexer-client, and prover-client. It does not document a single @midnight-ntwrk/wallet-sdk barrel as the reference entry. Use the package named in the sample you are following. Matrix pin remains Wallet SDK 1.2.0.',
    );
  }

  return result(
    'not-a-wallet-sdk-reference-gap',
    'Not the midnight-docs#831 reference gap. Wallet page: https://docs.midnight.network/api-reference/wallet-sdk. This classifier does not call the wallet and does not fix the public indexer or node.',
  );
}
