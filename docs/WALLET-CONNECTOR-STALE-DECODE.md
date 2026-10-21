# Stale DApp Connector samples decoder

Upstream: [midnightntwrk/midnight-docs#1569](https://github.com/midnightntwrk/midnight-docs/issues/1569)

Official pages read 2026-10-21:

- DApp Connector API 4.0.1: https://docs.midnight.network/api-reference/dapp-connector
- ConnectedAPI: https://docs.midnight.network/api-reference/dapp-connector/type-aliases/ConnectedAPI
- Configuration (`proverServerUri` optional and deprecated): https://docs.midnight.network/api-reference/dapp-connector/type-aliases/Configuration
- Midnight.js network IDs (`mainnet`, `preview`, `preprod`, `undeployed`): https://docs.midnight.network/sdks/official/midnight-js
- Integrate a wallet (only `'mainnet'` is connector-standard; other ids are wallet-defined; CLI uses capitalized strings): https://docs.midnight.network/sdks/community/wallets/community-wallets-integration
- Compatibility matrix (DApp Connector API 4.0.1): https://docs.midnight.network/relnotes/support-matrix

Issue #1569 lists published lines that do not match DApp Connector API 4.0.1 and Wallet SDK 1.2.0:

- `submitTransaction` takes only the transaction. `payFees` is on `makeTransfer`, `makeIntent`, and the two balance methods. The official connector page submits with `connected.submitTransaction(resultTransaction)`.
- Network IDs on the integration page are written `'Preview'` / `'PreProd'`. Midnight.js documents lowercase `preview`, `preprod`, and `undeployed`. Only `mainnet` is fixed by the connector spec; other ids are wallet-defined (the CLI connector uses capitalized forms). Copying the capitalized forms into a Midnight.js `setNetworkId` call is wrong.
- Sealed and unsealed balancing differ: unsealed balances in the same intent, sealed in a separate one.
- `selectWallet` helpers on the React and Next.js connect guides do not filter on `apiVersion`. The connector API says a DApp must check `apiVersion` (the official connect example filters on it).
- Atomic-swap notes omit that `initSwap` defaults `payFees` to `false` and that Wallet SDK 1.2.0 skips outputs of a token kind when that kind's inputs key is missing.
- `proverServerUri` is logged with no deprecation note. Configuration marks it optional and deprecated in favor of `getProvingProvider`.

This lab does not edit midnight-docs and does not claim the public pages, indexer, or node are fixed. `packages/preprod-hello-stub/src/wallet-connector-stale-decode.mjs` classifies a pasted snippet so a Preprod path can point at the official 4.0.1 surface instead of treating a refusal as an unknown error. It does not call a wallet or submit a transaction.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Official docs only: https://docs.midnight.network/.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
