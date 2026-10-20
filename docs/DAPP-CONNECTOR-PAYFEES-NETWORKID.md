# DApp Connector 4.0.1: payFees is not on submitTransaction; network IDs are lowercase

Upstream: [midnightntwrk/midnight-docs#1569](https://github.com/midnightntwrk/midnight-docs/issues/1569)

Official sources (do not invent APIs):

- https://docs.midnight.network/api-reference/dapp-connector
- https://docs.midnight.network/sdks/community/wallets/community-wallets-integration
- https://docs.midnight.network/relnotes/support-matrix

The community wallet integration page (integration.mdx) still contains stale lines against DApp Connector API 4.0.1:

- It says `submitTransaction` takes a `payFees` option. In 4.0.1 it takes only the transaction. `payFees` is on `makeTransfer`, `makeIntent`, and the two balance methods (`balanceSealedTransaction` / `balanceUnsealedTransaction`).
- It uses or implies capitalized `'Preview'` and `'PreProd'` as network IDs in places. The SDK and connector network IDs are `preview`, `preprod`, and `undeployed`. Only `mainnet` is fixed by the spec. A DApp copying capitalized forms will be refused by a wallet that checks them. The CLI connector is a separate no-extension fallback that expects capitalized forms; do not copy those into a browser DApp using the 4.0.1 connector.

Documented 4.0.1 usage from the API reference:

```js
const connected = await window.midnight.{selectedWalletId}.connect('preprod');
const submitted = await connected.submitTransaction(resultTransaction); // no payFees argument
```

`makeTransfer` and the balance methods accept an options object that can include `payFees` where the wallet implements fee payment.

This lab does not edit midnight-docs, does not claim the public page is fixed, and does not claim a fix of the public indexer or node.

Pins used by this lab: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Official docs only: https://docs.midnight.network/.

Also read this run: servicedesk#257 (mainnet deploys pending until TTL), servicedesk#254 (faucet amount unit), midnight-docs#1564 (runtime API version), example-hello-world#41 (unused deps). None of those are fixed here.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
