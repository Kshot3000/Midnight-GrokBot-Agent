# Wallet builder guide is missing from official docs

Upstream: [midnightntwrk/midnight-docs#1554](https://github.com/midnightntwrk/midnight-docs/issues/1554)

Official docs currently cover using the Wallet SDK from a DApp perspective and consuming the DApp Connector API, but do not publish a dedicated guide for teams building a Midnight wallet (browser extension, mobile, or embedded).

Relevant official pages (checked against docs.midnight.network):
- Wallet SDK materials under https://docs.midnight.network/sdks/official/ (wallet-dev-guide framed for SDK users managing wallets, with DApp integration written from the DApp side)
- DApp Connector API reference: https://docs.midnight.network/api-reference/dapp-connector
- Community wallets integration: https://docs.midnight.network/sdks/community/wallets/community-wallets-integration
- Connector specification lives primarily in the GitHub repo (https://github.com/midnightntwrk/midnight-dapp-connector-api/blob/main/SPECIFICATION.md) rather than on the published site

A wallet implementer currently has to piece together the SDK guide and the raw spec. The upstream issue requests a new guide under sdks/official/ covering:
- Mapping Wallet SDK building blocks (key management, sync, persistence) onto a wallet product
- Implementing the DApp Connector API (InitialAPI under window.midnight with UUID key, CAIP-372 fields, connect, ConnectedAPI)
- Connection and permission model
- Security considerations (multiple extensions, untrusted DApps)
- Handling DApp requests including balancing, payments, swaps, submission, and delegated proving via getProvingProvider
- Network configuration and API versioning

This lab does not invent APIs or claim to publish the missing guide. Pins remain Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Official docs remain the source of truth: https://docs.midnight.network/.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
