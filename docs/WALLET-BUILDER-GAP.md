# Wallet builder guide gap (Wallet SDK + DApp Connector)

Upstream: [midnightntwrk/midnight-docs#1554](https://github.com/midnightntwrk/midnight-docs/issues/1554)

Official pages (as of 2026-10-16):

- Wallet SDK developer guide: https://docs.midnight.network/sdks/official/wallet-developer-guide
- Wallet SDK API reference: https://docs.midnight.network/api-reference/wallet-sdk
- DApp Connector API (v4.0.1): https://docs.midnight.network/api-reference/dapp-connector
- InitialAPI type: https://docs.midnight.network/api-reference/dapp-connector/type-aliases/InitialAPI
- Community wallet integration (CAIP-372 notes): https://docs.midnight.network/sdks/community/wallets/community-wallets-integration
- Support matrix / release notes: https://docs.midnight.network/relnotes/support-matrix (and wallet / dapp-connector-api notes)

## What the issue records

There is no dedicated guide for teams building a Midnight wallet (browser extension, mobile, or embedded). The Wallet SDK guide covers building blocks (HD derivation, facade, state, addresses, transfers, balancing, DUST registration, swaps, WASM proving, lifecycle) but is framed for using the SDK, not for implementing a wallet product that exposes the DApp Connector API. The connector implementer surface lives mainly in the external SPECIFICATION.md; the docs link out rather than publishing the wallet-side requirements.

## Lab checklist (no invented APIs)

This lab does **not** implement a wallet and does **not** claim to fix the public indexer or node. The helper in `packages/preprod-hello-stub/src/wallet-builder-gap.mjs` only checks that a candidate InitialAPI object (the shape a wallet injects under `window.midnight`) carries the fields documented on the official InitialAPI page and the community integration page:

- `rdns` (stable reverse-DNS identifier)
- `name`
- `icon`
- `apiVersion` (string matching the `@midnight-ntwrk/dapp-connector-api` version the wallet implements; pin in this lab is 4.0.1)
- `connect` (function that accepts a networkId string and returns a Promise of ConnectedAPI)

Network id note from official community page: only `'mainnet'` is connector-standard; other ids (`preprod`, `preview`, `undeployed`) are wallet-defined.

Pins for this lab: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Run:

```bash
cd packages/preprod-hello-stub
node src/wallet-builder-gap.mjs
```

Or `npm run check:wallet-builder-gap` after the script is registered.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
