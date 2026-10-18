# Wallet builder guide gap

Upstream: [midnightntwrk/midnight-docs#1554](https://github.com/midnightntwrk/midnight-docs/issues/1554)

The published docs have a Wallet SDK guide framed for using the SDK to manage wallets, and a DApp Connector API reference framed for DApps that consume `window.midnight`. There is no single guide that tells a team building a browser extension, mobile app, or embedded wallet how to implement the connector on top of the SDK.

Official sources only (do not invent APIs):

- Wallet SDK guide: https://docs.midnight.network/sdks/official/wallet-developer-guide
- Wallet SDK API reference: https://docs.midnight.network/api-reference/wallet-sdk
- DApp Connector API: https://docs.midnight.network/api-reference/dapp-connector
- Community wallets integration (consumer side): https://docs.midnight.network/sdks/community/wallets/community-wallets-integration
- Connector specification: https://github.com/midnightntwrk/midnight-dapp-connector-api/blob/main/SPECIFICATION.md

Documented surfaces a wallet product owns (restated from those pages):

- HD key derivation via `@midnightntwrk/wallet-sdk-hd` (BIP-32 / BIP-44 / CIP-1852).
- `WalletFacade.init` coordinating `ShieldedWallet`, `UnshieldedWallet`, and `DustWallet`.
- Inject an Initial API under `window.midnight` keyed by an identifier, exposing `name`, `icon`, `apiVersion`, and `connect(networkId)`.
- ConnectedAPI methods for balances, addresses, configuration, transfers, balancing, submission, and `getProvingProvider` (feature-detect; Lace does not expose it).

This lab does not implement a wallet, does not edit midnight-docs, and does not claim a public fix. `packages/preprod-hello-stub/src/wallet-builder-gap.mjs` only flags the missing implementer guide so a builder can locate the published pieces.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Official docs only: https://docs.midnight.network/.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
