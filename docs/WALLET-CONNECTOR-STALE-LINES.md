# Wallet and connector pages: stale lines (lab)

Upstream: [midnightntwrk/midnight-docs#1569](https://github.com/midnightntwrk/midnight-docs/issues/1569)

The open docs issue collects published lines that are wrong or out of date against DApp Connector API 4.0.1 and Wallet SDK 1.2.0. This lab does not edit midnight-docs. It only restates the mismatches the issue lists and what the published connector reference currently shows. It does not invent methods, does not claim a public indexer or node fix, and does not change any studio HTML, CSS, or Pages.

Official sources (read 2026-10-19):

- https://docs.midnight.network/api-reference/dapp-connector (package `@midnight-ntwrk/dapp-connector-api` v4.0.1)
- https://docs.midnight.network/api-reference/dapp-connector/type-aliases/WalletConnectedAPI (submitTransaction takes only `tx`)
- https://docs.midnight.network/guides/react-wallet-connect (network id sample uses `'preprod'`)
- https://docs.midnight.network/relnotes/dapp-connector-api/dapp-connector-api-4-0-1 (`payFees` added to all transacting methods that already had the option pattern)

Pins for this lab: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Points the issue flags, checked against those pages:

1. `submitTransaction` does not take a `payFees` option. The connector type page shows `submitTransaction(tx): Promise<void>`. The option lives on `makeTransfer`, `makeIntent`, `balanceSealedTransaction`, and `balanceUnsealedTransaction` (true by default). The integration page cited in the issue is no longer at the old path; the published community integration page now says `submitTransaction(tx)` with no option in the method table, while an earlier sentence still mentions a `payFees` option on submit.
2. Network IDs. The SDK and the published connect samples use lowercase `preview`, `preprod`, and `undeployed`. Only `mainnet` is fixed by the spec. Capitalized `'Preview'` / `'PreProd'` strings appear in some CLI-oriented snippets and would be refused by a wallet that checks the SDK IDs.
3. Sealed vs unsealed balancing. The connector page separates them: unsealed balances inside the same intent (typical for a contract call), sealed balances in a separate intent (typical for completing a swap). Grouping both as simply "contract-built" loses that distinction.
4. `selectWallet` helpers in the React and Next.js connect guides do not filter on `apiVersion`. The connector page and the specification say a DApp must check `apiVersion` (semver) before connecting.
5. Other items in the issue (initSwap default `payFees`, deprecated `proverServerUri`, leaderboard tutorial optional field) are outside the connector surface this lab pins. The lab does not restate Wallet SDK method details that are not on the published connector pages.

Builders on this lab should follow the connector type pages and the 4.0.1 release notes, not the stale lines. Re-check the compatibility matrix before any deploy.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
