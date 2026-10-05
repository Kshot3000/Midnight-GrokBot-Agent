# Compact 0.31.1 range-check pin

Upstream: [midnightntwrk/midnight-docs#1245](https://github.com/midnightntwrk/midnight-docs/issues/1245)

Official docs: https://docs.midnight.network/tokens/unshielded-token

The unshielded-token tutorial targets Compact compiler 0.31.1. It says version 0.31.0 could drop a range-check constraint from generated ZK circuits for certain casts, which 0.31.1 fixes. The same page pins language `pragma language_version 0.23` and midnight-js packages at 4.1.1, and the Preprod proof server image at `midnightntwrk/proof-server:8.1.0`.

Issue #1245 reports that the EffectStream cross-chain guide still tells readers to run `compact update 0.31.0`. That command is the compiler version the official tutorial warns about. The issue also says `compact update` switches the machine-wide default, and that `disclose()` does not publish: https://docs.midnight.network/guides/security-best-practices#on-chain-visibility says `disclose()` only clears the compiler private-data check. Visibility comes from a ledger write, an exported-circuit return, or a contract-to-contract call.

`packages/preprod-hello-stub/src/compiler-pin-invariant.mjs` is a source check only. It rejects a language pin below 0.23, a bare `compact update 0.31.0` snippet, and a comment that says `disclose()` publishes. It does not compile Compact, does not call the proof server, and does not claim a Preprod deploy. This lab note does not fix the public indexer or node.

Pins used here: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
