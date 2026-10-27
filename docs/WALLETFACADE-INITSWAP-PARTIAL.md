# WalletFacade.initSwap returns partial transactions for mixed kinds

Upstream: [midnightntwrk/servicedesk#99](https://github.com/midnightntwrk/servicedesk/issues/99)

Official docs only:
- Build a Midnight wallet: https://docs.midnight.network/sdks/official/build-a-wallet — table mapping `makeIntent` to `WalletFacade.initSwap`
- Support matrix: https://docs.midnight.network/relnotes/support-matrix — Wallet SDK 1.2.0, DApp Connector API 4.0.1

Issue #99 reports that when a swap mixes kinds (shielded input + unshielded output, or the reverse), `WalletFacade.initSwap` returns a transaction that contains only the leg matching the present inputs key. The outputs of the other kind are dropped with no error. Downstream signing, proving, and balancing do not add them back.

The official build-a-wallet guide (targeting Wallet SDK 1.2.0) records the same rule in the connector-methods table:

> makeIntent | initSwap | initSwap takes no intent ID, and puts any unshielded part in segment 1. It ignores the outputs of a kind whose inputs key is missing, and its payFees defaults to false, so pass both input keys and payFees.

Builders must therefore pass an inputs object that contains both `shielded` and `unshielded` keys (empty objects are fine) whenever the outputs array contains both kinds. `payFees` must also be passed explicitly because it defaults to false on `initSwap`.

This lab note does not invent APIs, does not call the Wallet SDK, and does not claim a fix of the public indexer, node, or wallet SDK. It only records the reported partial-transaction behavior and the published mitigation so builders on the pinned stack can avoid it.

## Lab helper

`packages/preprod-hello-stub/src/initswap-partial-decode.mjs` exports a pure classifier that inspects a proposed inputs object against an outputs list and warns when a kind is present in outputs but missing from inputs. LOCAL-TRUE. No network, no prove, no SDK call.

Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
