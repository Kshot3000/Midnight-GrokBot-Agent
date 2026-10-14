# Gap: no published guide for teams building a Midnight wallet

Upstream: [midnightntwrk/midnight-docs#1554](https://github.com/midnightntwrk/midnight-docs/issues/1554)

Official docs currently split the material a wallet builder needs:

- The Wallet SDK guide (https://docs.midnight.network/sdks/official/wallet-developer-guide) covers HD derivation, facade init, state, address encoding, transfers, balancing, DUST, and lifecycle. It is written for using the SDK to manage wallets, and its DApp integration section is from the DApp side (reading `window.midnight`).
- The DApp Connector API page (https://docs.midnight.network/api-reference/dapp-connector, package `@midnight-ntwrk/dapp-connector-api` v4.0.1) is for DApps that consume a wallet.
- The implementer requirements live only in the raw specification: https://github.com/midnightntwrk/midnight-dapp-connector-api/blob/main/SPECIFICATION.md (InitialAPI under `window.midnight` keyed by UUID, CAIP-372 fields `rdns`/`name`/`icon`/`apiVersion`, frozen objects, `connect(networkId)`, ConnectedAPI surface, permission model, and `getProvingProvider`).

A wallet team must currently assemble the SDK guide, the connector page, and the GitHub spec themselves. This lab does not invent APIs or claim to fill the official gap. It only points builders at the published pages and the open docs issue while the upstream guide is written.

Pins this lab tracks: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Official source of truth: https://docs.midnight.network/ and https://docs.midnight.network/relnotes/support-matrix.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
