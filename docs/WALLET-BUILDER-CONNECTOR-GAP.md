# Wallet builder guide gap (lab)

Upstream: [midnightntwrk/midnight-docs#1554](https://github.com/midnightntwrk/midnight-docs/issues/1554) asks for a guide aimed at teams building a Midnight wallet (browser extension, mobile, or embedded). The Wallet SDK guide covers using the SDK to manage wallets. The DApp Connector README and community wallets pages are written from the DApp side. The implementer requirements live in the connector specification on GitHub; a copy sits under the docs media but is not published on the site.

This lab note only points at published official pages and the public specification. It does not invent connector methods, wallet APIs, or claiming any public fix.

Official sources:

- https://docs.midnight.network/sdks/official/wallet-developer-guide
- https://docs.midnight.network/api-reference/dapp-connector
- https://docs.midnight.network/api-reference/dapp-connector/type-aliases/InitialAPI
- https://docs.midnight.network/sdks/community/wallets/community-wallets-integration
- https://github.com/midnightntwrk/midnight-dapp-connector-api/blob/main/SPECIFICATION.md (public spec)

Pins for this lab: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Documented facts a wallet builder can use today (from the pages above, not invented):

- A browser wallet injects an `InitialAPI` under `window.midnight` under its own key. The type carries `rdns`, `name`, `icon`, `apiVersion`, and `connect(networkId)`.
- `apiVersion` is a string version of `@midnight-ntwrk/dapp-connector-api`. This lab pins 4.0.1.
- `connect(networkId)` returns a `ConnectedAPI`. Only `'mainnet'` is standardized by the connector; other ids are wallet-defined.
- The community integration page notes wallets such as Lace inject under friendly keys (`window.midnight.mnLace`) while the v4 spec installs under a UUID key and exposes stable `rdns`.
- The Wallet SDK developer guide covers HD derivation, facade init, state, addresses, transfers, DUST registration, and lifecycle for code that *uses* the SDK. It is not a product-level wallet implementer guide.
- Security notes on the community page: sanitize `name`, render `icon` via `<img>`, never `innerHTML`.

The requested guide (Wallet SDK mapping + implementing the connector as a wallet, permission model, what to expose, delegated proving, network config) is still open in the upstream issue. This lab does not ship that guide.

Lab pointer (no network, no injection): `packages/preprod-hello-stub/src/wallet-builder-gap.mjs`.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
