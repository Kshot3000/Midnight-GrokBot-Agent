# Empty Bytes constructor does not compile

Upstream: [midnightntwrk/midnight-docs#1487](https://github.com/midnightntwrk/midnight-docs/issues/1487)

Official: [Writing Compact](https://docs.midnight.network/compact/reference/writing) and [Using Compact contracts from JavaScript](https://docs.midnight.network/guides/compact-javascript-runtime)

The Test and debug page Compact sample (lines 34-54) does not compile against Compact toolchain 0.31.1 / language ~0.23:

- top-level `const`
- `Bytes<32>{}` (empty constructor is not valid)
- a ledger write that needs `disclose()`

`contracts/hello-midnight/no-empty-bytes.compact` is a source-only counterpart that takes `Bytes<32>` and writes it with `disclose`. It is not compiled or deployed here. This lab does not edit midnight-docs and does not claim a public indexer or node fix.

Pins: Compact ~0.31.1, language >= 0.23, compact-runtime 0.16.0, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
