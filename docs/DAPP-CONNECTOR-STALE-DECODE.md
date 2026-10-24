# DApp connector and wallet page stale lines (lab decode)

Upstream: [midnightntwrk/midnight-docs#1569](https://github.com/midnightntwrk/midnight-docs/issues/1569)

Official: https://docs.midnight.network/api-reference/dapp-connector (DApp Connector API 4.0.1)

Issue #1569 collects published lines that do not match DApp Connector API 4.0.1 or Wallet SDK 1.2.0. This lab note only restates what the published API page and the issue already record. It does not invent methods, does not call a wallet, and does not claim a fix of midnight-docs, the public indexer, or the node.

Recorded mismatches (from the issue, against the 4.0.1 type pages):

- `submitTransaction` takes only the sealed transaction. `payFees` is on `makeTransfer`, `makeIntent`, and the balance methods, not on `submitTransaction`.
- Network ID strings other than `mainnet` are wallet-defined. The SDK uses `preview`, `preprod`, and `undeployed`. Capitalized forms such as `Preview` or `PreProd` are refused by a wallet that checks them.
- Sealed and unsealed balancing differ: unsealed balances in the same intent, sealed in a separate one.
- Connect samples should filter on `apiVersion`. The published connect sample on the API page uses `^1.0`; this lab pins connector 4.0.1, so a checker should not treat a 1.x filter as the only compatible set.
- `Configuration.proverServerUri` is deprecated (planned removal in 5.0.0). Prefer feature-detecting `getProvingProvider` and falling back to a local proof server.

Lab classifier (no network, no wallet): `packages/preprod-hello-stub/src/dapp-connector-stale-decode.mjs`. It flags pasted snippets that put `payFees` on `submitTransaction` or use capitalized network ID strings.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
