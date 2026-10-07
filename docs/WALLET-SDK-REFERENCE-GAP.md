# Wallet SDK API reference gap (lab note)

Upstream: [midnightntwrk/midnight-docs#831](https://github.com/midnightntwrk/midnight-docs/issues/831)

Opened 2026-04-15. The report said the Wallet SDK API reference was missing from https://docs.midnight.network/api-reference, and asked whether automation should publish it the way Midnight.js reference pages are published.

This lab file does not add a page to midnight-docs, does not generate a function index, and does not call `WalletFacade`. It does not claim the public indexer or node was fixed.

## What is published now

Checked against the live docs on 2026-10-07:

- The API index lists Wallet SDK and links a reference page. https://docs.midnight.network/api-reference
- Narrative page: https://docs.midnight.network/api-reference/wallet-sdk
- Packages named on that page: `@midnight-ntwrk/wallet-sdk-facade`, `wallet-sdk-unshielded-wallet`, `wallet-sdk-shielded`, `wallet-sdk-dust-wallet`, `wallet-sdk-hd`, `wallet-sdk-address-format`, `wallet-sdk-node-client`, `wallet-sdk-indexer-client`, `wallet-sdk-prover-client`.
- Samples on that page show `WalletFacade.init`, `WalletFacade.fetchTermsAndConditions`, `wallet.acceptTermsAndConditions`, `wallet.transferTransaction`, `wallet.signRecipe`, and `wallet.finalizeRecipe`. The transfer sample imports `ledger` from `@midnight-ntwrk/ledger-v8`.
- Compatibility matrix pins Wallet SDK **1.2.0** next to Midnight.js **4.1.1** and DApp Connector API **4.0.1**. https://docs.midnight.network/relnotes/support-matrix

## What #831 still asks

The narrative page is not the generated function index the issue asked about. #831 is still open. This lab does not invent missing method signatures to fill that gap.

A bare `Cannot find module '@midnight-ntwrk/wallet-sdk'` is not answered by the Packages table. Follow the package named in the sample (`wallet-sdk-facade` for `WalletFacade.init`). The matrix pin stays 1.2.0.

Helper: `packages/preprod-hello-stub/src/wallet-sdk-reference.mjs`

Pins used by this lab: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
