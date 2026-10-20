# Matrix pin note: stay on Compact 0.31.1 / runtime 0.16.0

Upstream: [midnightntwrk/midnight-docs#1564](https://github.com/midnightntwrk/midnight-docs/issues/1564)

Official compatibility matrix: https://docs.midnight.network/relnotes/support-matrix

Preview, Preprod, and Mainnet list Compact toolchain 0.31.1 and Compact runtime 0.16.0. The matrix note states that Compact toolchains 0.34.0 and 0.35.0 and Compact runtimes 0.19.0 and 0.20.0 target ledger 9 and do not work with those versions. The Compact runtime API reference documents 0.20.0, so functions such as `jubjubSchnorrSign` are listed but are not exported by 0.16.0.

This lab pins Compact ~0.31.1 / language >= 0.23, compact-runtime 0.16.0, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. It does not invent APIs.

Lab source: `contracts/hello-midnight/matrix-pin-note.compact`

- `pragma language_version >= 0.23;`
- A public ledger write uses `disclose()` so the compiler accepts the private circuit argument.
- Source only. Not compiled and not deployed in this lab.

`packages/preprod-hello-stub/src/matrix-pin-note.mjs` checks that source for the pragma and the `disclose` write. It does not call the compiler or a proof server.

This note does not edit midnight-docs and does not claim a fix of the public indexer or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
