# WalletFacade.initSwap drops the counter-leg on mixed swaps

Upstream: [midnightntwrk/servicedesk#99](https://github.com/midnightntwrk/servicedesk/issues/99)

On the Wallet SDK, `WalletFacade.initSwap` can return a transaction that contains only the leg matching the input kind when a swap mixes shielded and unshielded. A shielded input with an unshielded output produces a transaction that lacks the requested unshielded output. The reverse (unshielded input, shielded output) lacks the shielded output. Nothing fails; the partial transaction can be signed, proved, balanced, and submitted, so one side moves while the other does not.

The issue traces the guard in the facade that builds a leg only when the corresponding inputs key is present. Mixed swaps are noted as unsupported in the e2e suite ("Not supported yet"). An explicit rejection would be safer than a silent partial transaction.

This lab note is only a builder warning. It does not call the wallet SDK, does not invent a new swap API, and does not claim to fix the public Wallet SDK, indexer, or node. Builders should inspect the returned transaction structure (both `guaranteedOffer` / intents and the requested outputs) before treating an `initSwap` result as complete, or avoid mixed-kind swaps until the upstream issue is resolved.

Official Wallet SDK material: https://docs.midnight.network/ (search the official SDKs section). Pins remain Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
