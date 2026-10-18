/**
 * wallet-builder-gap.mjs — flag the missing wallet-builder guide.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1554
 * Official: https://docs.midnight.network/sdks/official/wallet-developer-guide
 *          https://docs.midnight.network/api-reference/dapp-connector
 * Does not call any API, does not invent methods, LOCAL-TRUE. No on-chain claim.
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const WALLET_BUILDER_GAP = Object.freeze({
  upstream: 'https://github.com/midnightntwrk/midnight-docs/issues/1554',
  officialWalletSdk: 'https://docs.midnight.network/sdks/official/wallet-developer-guide',
  officialConnector: 'https://docs.midnight.network/api-reference/dapp-connector',
  note: 'No published implementer guide maps the Wallet SDK onto a wallet product that injects the DApp Connector API under window.midnight. Use the published pages; do not invent APIs.',
});

export function describeWalletBuilderGap() {
  return WALLET_BUILDER_GAP.note;
}
