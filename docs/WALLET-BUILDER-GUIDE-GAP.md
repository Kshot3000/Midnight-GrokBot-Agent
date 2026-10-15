# Wallet builder guide gap (lab)

Upstream: [midnightntwrk/midnight-docs#1554](https://github.com/midnightntwrk/midnight-docs/issues/1554)

The open docs issue asks for a guide that maps the Wallet SDK onto a wallet product and that describes implementing the DApp Connector API from the wallet side. The published site currently has no such page. The Wallet SDK guide path cited in the issue (`sdks/official/wallet-dev-guide.mdx`) returns Page Not Found on https://docs.midnight.network/sdks/official/wallet-dev-guide. The DApp Connector material is written for DApp consumers.

This lab does not edit midnight-docs. It only restates what the published DApp Connector page and the connector specification already say a wallet must expose. It does not invent methods, does not claim a public wallet, and does not fix the indexer or node.

Official sources (read 2026-10-15):

- https://docs.midnight.network/api-reference/dapp-connector (package `@midnight-ntwrk/dapp-connector-api` v4.0.1)
- https://github.com/midnightntwrk/midnight-dapp-connector-api/blob/main/SPECIFICATION.md (InitialAPI, CAIP-372 fields, install rules)

Pins for this lab: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

What a wallet must install, from those pages:

1. Expose the Initial API under `window.midnight` keyed by a UUID. The published connector page says the shape is `window.midnight.{someWalletIdString}` so multiple wallets can inject without colliding.
2. Initial API fields named on the connector page: `name`, `icon`, `apiVersion`, `connect(networkId)`. The specification additionally requires `rdns` (reverse DNS) for CAIP-372 compatibility. `apiVersion` is the version of `@midnight-ntwrk/dapp-connector-api` the wallet implemented (example on the page: a wallet implementing 3.1.5 reports `'3.1.5'`). This lab pins 4.0.1.
3. `connect(networkId)` returns a promise of the ConnectedAPI. The published connect sample uses network ids such as `mainnet` and `preprod`.
4. Once connected, the ConnectedAPI surface on the published page includes `getConfiguration`, `getConnectionStatus`, `getShieldedBalances`, `getUnshieldedBalances`, `getDustBalance`, `getShieldedAddresses`, `getUnshieldedAddress`, `getDustAddress`, `makeTransfer`, `balanceUnsealedTransaction`, `balanceSealedTransaction`, `submitTransaction`, and `getProvingProvider`. The specification lists the same groups (balances, addresses, InitActions, AccessConfiguration, DelegateProving, SubmitTransaction).
5. The specification says the first wallet to install `window.midnight` must freeze the object against later overrides, install its InitialAPI under a fresh UUIDv4 with non-writable properties, and freeze both the InitialAPI and the later ConnectedAPI. DApps must sanitize `name` and `icon` (icon only inside an `img` tag) and must check `apiVersion` with semver before connecting.

`packages/preprod-hello-stub/src/wallet-builder-gap.mjs` checks a local plan against those published field names. It does not open a wallet or a network.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
