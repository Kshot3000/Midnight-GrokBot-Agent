# Wallet-builder guide is still missing

Upstream: [midnightntwrk/midnight-docs#1554](https://github.com/midnightntwrk/midnight-docs/issues/1554)

The open issue asks for a guide aimed at teams building a Midnight wallet (browser extension, mobile app, or embedded wallet). Official material is currently split between the Wallet SDK guide (framed for using the SDK) and the DApp Connector API (framed for DApps that consume a wallet). The implementer side of the connector lives in the specification on GitHub.

Official pages this lab follows (read 2026-10-14). They are not a wallet-implementer guide:

- https://docs.midnight.network/sdks/official/wallet-dev-guide (Wallet SDK: key derivation, facade, state, transfers, DUST, swaps)
- https://docs.midnight.network/api-reference/dapp-connector (DApp Connector API v4.0.1, InitialAPI under `window.midnight`, `connect`, ConnectedAPI)
- https://docs.midnight.network/sdks/community/wallets/community-wallets-integration (DApp-side integration)
- https://docs.midnight.network/relnotes/dapp-connector-api (release notes; lab pin is DApp Connector 4.0.1)
- https://github.com/midnightntwrk/midnight-dapp-connector-api/blob/main/SPECIFICATION.md (implementer requirements; not published on the docs site)

Issue #1554 lists what a wallet guide should cover: mapping the Wallet SDK onto a product (key management, sync, persistence), injecting the Initial API with CAIP-372 fields (`rdns`, `name`, `icon`, `apiVersion`), the connection and permission model, handling DApp requests (balancing, payments, swaps, submission, delegated proving via `getProvingProvider`), network configuration, and API versioning. Check every API against the support matrix before writing.

This lab does not invent those APIs or publish a wallet implementation. Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Related lab note for the Node seed-to-deploy gap: `docs/NODE-SEED-WALLET-GUIDE-GAP.md` (midnight-docs#1380).

This does not fix the public docs site, indexer, or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
