# Mixed initSwap leg (lab)

Open report: [midnightntwrk/servicedesk#99](https://github.com/midnightntwrk/servicedesk/issues/99).

`WalletFacade.initSwap` on a mixed swap (shielded input with an unshielded output, or the reverse) returns a transaction that only contains the leg matching the input kind. The other output is absent. Nothing fails: the one-legged transaction can sign, prove, balance, and submit. The wallet e2e suite skips the combined case with "Not supported yet."

The published wallet guide shows a shielded-for-shielded example: the initiator calls `initSwap`, then `finalizeRecipe`; the counterparty calls `balanceFinalizedTransaction`, then `finalizeRecipe`, then `submitTransaction`. That page does not document mixed kinds.

https://docs.midnight.network/sdks/official/wallet-developer-guide

This lab classifier (`packages/preprod-hello-stub/src/mixed-swap-leg.mjs`) refuses a mixed input/output shape, and names a returned snapshot whose `intents` are empty (unshielded want dropped) or whose `guaranteedOffer` is missing (shielded want dropped). It does not call the wallet SDK. It does not fix the wallet, the public indexer, or the node.

Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Issue #99 named wallet-sdk-facade 4.0.1; this note does not upgrade that package.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
