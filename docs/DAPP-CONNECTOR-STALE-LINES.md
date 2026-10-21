# DApp Connector 4.0.1 stale lines from the wallet guide review

Upstream: [midnightntwrk/midnight-docs#1569](https://github.com/midnightntwrk/midnight-docs/issues/1569)

Official reference (DApp Connector API v4.0.1), read 2026-10-21:

- https://docs.midnight.network/api-reference/dapp-connector
- https://docs.midnight.network/api-reference/dapp-connector/type-aliases/WalletConnectedAPI
- Release note: https://docs.midnight.network/relnotes/dapp-connector-api/dapp-connector-api-4-0-1

From the ConnectedAPI type alias page:

`submitTransaction(tx): Promise<void>` — takes only the sealed transaction. No `payFees` option appears on the signature. The issue notes that the community integration page says `submitTransaction` takes a `payFees` option; the type page does not.

`balanceSealedTransaction` and `balanceUnsealedTransaction` both document an optional `payFees` (true by default). `makeTransfer` and `makeIntent` also take options that include fee control (per the 4.0.1 release note: `payFees` was added to all transacting methods).

Network IDs: the connector page example uses `NetworkId('preprod')` and `connect('mainnet')`. The community integration page (cited by the issue) uses capitalized `'Preview'` / `'PreProd'` in places. The issue states that SDK network IDs are `preview`, `preprod`, and `undeployed`, and only `mainnet` is fixed by the spec. A DApp that copies the capitalized strings can be refused by a wallet that checks them.

The issue also notes that sealed and unsealed balancing are grouped together as "contract-built" on the integration page, but the type docs distinguish them: unsealed for contract-call preimage data, sealed for already-bound transactions.

This lab does not edit midnight-docs, does not ship a connector implementation, and does not invent method signatures. `packages/preprod-hello-stub/src/dapp-connector-stale-decode.mjs` classifies pasted snippets that contain the patterns called out by the issue (`submitTransaction(..., { payFees`, capitalized `PreProd` / `Preview` as networkId, etc.) so a builder can map them to the 4.0.1 type pages. It does not call a wallet or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. This does not claim a fix to the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
