# DApp Connector 4.0.1: submitTransaction takes only the transaction

Upstream: [midnightntwrk/midnight-docs#1569](https://github.com/midnightntwrk/midnight-docs/issues/1569)

Official:

- https://docs.midnight.network/api-reference/dapp-connector/type-aliases/WalletConnectedAPI
- https://docs.midnight.network/api-reference/dapp-connector
- https://docs.midnight.network/relnotes/dapp-connector-api/dapp-connector-api-4-0-1
- https://docs.midnight.network/guides/react-wallet-connect
- https://docs.midnight.network/sdks/community/wallets/community-wallets-integration

Issue #1569 flags published lines that do not match DApp Connector API 4.0.1. From the official WalletConnectedAPI reference:

- `submitTransaction(tx): Promise<void>` — only the transaction string. It expects a balanced, sealed transaction. It does not accept a `payFees` option.
- `payFees` is on `makeTransfer`, `makeIntent`, `balanceUnsealedTransaction`, and `balanceSealedTransaction` (true by default on the balance and transfer methods).
- Network IDs in the SDK / connector samples are lowercase: `preview`, `preprod`, `undeployed` (and `mainnet`). Capitalized forms are wallet-specific (for example the CLI connector).
- Wallet discovery: InitialAPI carries `apiVersion`. A DApp should filter injected wallets to a supported version before connecting. The react-wallet-connect `selectWallet` example returns the first entry without an `apiVersion` check.

Lab helper: `packages/preprod-hello-stub/src/dapp-connector-submit-shape.mjs` exports the official method shape and a pure filter that keeps only wallets whose `apiVersion` matches the pinned 4.0.1. It does not call a wallet or invent APIs.

This lab does not claim a fix of the public docs, indexer, or node. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
