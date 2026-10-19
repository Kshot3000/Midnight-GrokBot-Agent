# Wallet and connector pages: stale lines against DApp Connector 4.0.1

Upstream: [midnightntwrk/midnight-docs#1569](https://github.com/midnightntwrk/midnight-docs/issues/1569)

Open docs issue collected from the SME review of the wallet builder guide. Published lines disagree with DApp Connector API 4.0.1 and Wallet SDK 1.2.0. This lab only records the mismatches so builders on the pinned stack do not copy them. It does not edit the public docs site, invent methods, or claim a fix of the indexer or node.

Official sources (checked 2026-10-19):

- https://docs.midnight.network/api-reference/dapp-connector (v4.0.1)
- https://docs.midnight.network/api-reference/dapp-connector/type-aliases/ConnectedAPI
- Support matrix and pins used by this lab: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0

Known stale points from the issue, restated against the published connector page:

1. `submitTransaction` takes only the transaction. The connector page sample is `connected.submitTransaction(resultTransaction)`. There is no `payFees` option on that method. `payFees` appears on `makeTransfer`, `makeIntent`, and the balance methods.
2. Network IDs on the connector page and midnight-js network-id helpers are lowercase (`mainnet`, `preprod`, `preview`, `undeployed`). Capitalized `'Preview'` / `'PreProd'` will be refused by a wallet that checks the id.
3. Sealed and unsealed balancing are different methods: `balanceUnsealedTransaction` (typical after a contract call) and `balanceSealedTransaction` (typical after `makeIntent` / swap). They are not interchangeable.
4. DApps must filter wallets on `apiVersion` with a semver check before `connect`. The connector page "Connect" sample does this. Helpers that skip the filter do not follow the published requirement.
5. `getConfiguration` still returns `proverServerUri`. The issue notes it is deprecated and planned for removal in 5.0.0. Prefer `getProvingProvider()` when the wallet implements it; do not log or depend on the deprecated field as the long-term path.
6. For atomic swaps, `initSwap` defaults `payFees` to `false`. If a token kind's inputs key is missing, Wallet SDK 1.2.0 skips outputs of that kind; pass an empty object for the inputs key when needed.

This lab stays on the pinned 4.0.1 surface. `packages/preprod-hello-stub/src/wallet-connector-stale-lines.mjs` only classifies the points above; it does not call a wallet or a network.

Also read this run: servicedesk#257 (mainnet deploys pending until TTL; not a public node fix), servicedesk#254 (faucet amount unit), midnight-docs#1564 (runtime API ref version), midnight-docs#1561 (release notes descriptions), example-hello-world#41 (unused deps). None of those are fixed here.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
