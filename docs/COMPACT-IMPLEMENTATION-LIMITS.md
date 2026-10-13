# Compact implementation-specific limits

Upstream: [midnightntwrk/midnight-docs#1387](https://github.com/midnightntwrk/midnight-docs/issues/1387) (Compact reference gaps from the Kapa review)

Official: [Compact reference — Implementation-specific limits](https://docs.midnight.network/compact/reference/compact-reference#implementation-specific-limits)

The Compact reference (reviewed for language 0.27.0; lab pins ~0.31.1 / language ~0.23) lists:

- Maximum Field value: 52435875175126190479447740508185965837690552500527637822603658699938581184512
- Maximum Uint value: 452312848583266388373324160190187140051835877600158453279131187530910662655 (fits in 31 field bytes)
- Maximum length of a Vector or Bytes: 16777216
- (Related release notes also bound MerkleTree / HistoricMerkleTree depth at 32)

These are not stated as hard circuit counts. Builders hit them when a type or loop bound is too large; the compiler or proof server then fails without a clear upstream issue link. This lab records the numbers so a preprod path can assert them before a prove call. It does not invent an API, does not compile here, and does not claim to fix the public indexer or node.

See `packages/preprod-hello-stub/src/compact-impl-limits.mjs` and `contracts/hello-midnight/impl-limits.compact`.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
