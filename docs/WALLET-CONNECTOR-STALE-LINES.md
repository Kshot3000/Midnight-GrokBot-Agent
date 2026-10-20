# Wallet and connector pages: stale lines vs DApp Connector API 4.0.1

Upstream: [midnightntwrk/midnight-docs#1569](https://github.com/midnightntwrk/midnight-docs/issues/1569)

Issue #1569 lists published lines that are wrong or out of date against DApp Connector API 4.0.1 and Wallet SDK 1.2.0. This lab does not edit the public docs site and does not claim a fix of the public indexer or node. Pins remain Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Official API (source of truth for signatures):

- https://docs.midnight.network/api-reference/dapp-connector/type-aliases/WalletConnectedAPI
- https://docs.midnight.network/relnotes/dapp-connector-api/dapp-connector-api-4-0-1

What the official WalletConnectedAPI type shows for 4.0.1:

- `submitTransaction(tx): Promise<void>` — no options, no `payFees`. The transaction must already be balanced and sealed.
- `makeTransfer(desiredOutputs, options?)` — options include `payFees?: boolean` (true by default).
- `makeIntent(desiredInputs, desiredOutputs, options)` — options include `payFees: boolean`.
- `balanceUnsealedTransaction(tx, options?)` and `balanceSealedTransaction(tx, options?)` — options include `payFees?: boolean` (true by default). Unsealed balances in the same intent; sealed balances in a separate one.

Reported mismatches in #1569 (builders should prefer the API reference above until the pages are updated):

- Community integration page says `submitTransaction` takes a `payFees` option. The type does not.
- Same page uses `'Preview'` and `'PreProd'` as network IDs. The issue notes the SDK IDs are `preview`, `preprod`, and `undeployed` (only `mainnet` is fixed by the spec). Capitalized forms may be refused by a wallet that checks them.
- Sealed and unsealed balancing are grouped together as "contract-built". They differ as above.
- React and Next.js `selectWallet` helpers do not filter on `apiVersion` (the spec says a DApp must).
- Atomic-swap section does not note that `initSwap` defaults `payFees` to `false`, or the Wallet SDK 1.2.0 skip of outputs for a token kind when that kind's inputs key is missing.
- `proverServerUri` is logged with no deprecation note (planned removal in 5.0.0). Prefer `getProvingProvider()` with a fallback.

Lab files:

- `packages/preprod-hello-stub/src/wallet-connector-stale-lines.mjs` — classifies a pasted snippet. No network calls.
- `contracts/hello-midnight/wallet-connector-stale-note.compact` — Compact note only. No circuit.

Workaround: copy method signatures from the WalletConnectedAPI page, pass lowercase network IDs that the target wallet documents, filter on `apiVersion` when selecting a wallet, and put `payFees` only on methods that declare it.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
