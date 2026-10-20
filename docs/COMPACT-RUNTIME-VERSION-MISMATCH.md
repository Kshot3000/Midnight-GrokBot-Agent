# Compact runtime API reference documents 0.20.0 while networks run 0.16.0

Upstream: [midnightntwrk/midnight-docs#1564](https://github.com/midnightntwrk/midnight-docs/issues/1564)

Official compatibility matrix: [https://docs.midnight.network/relnotes/support-matrix](https://docs.midnight.network/relnotes/support-matrix)

The Compact runtime API reference at [https://docs.midnight.network/api-reference/compact-runtime](https://docs.midnight.network/api-reference/compact-runtime) is generated from `@midnight-ntwrk/compact-runtime` v0.20.0. That is the ledger 9 line.

Preview, Preprod, and Mainnet all run ledger 8. The support matrix pairs them with Compact toolchain 0.31.1 and Compact runtime 0.16.0. The matrix note states that runtimes 0.19.0 and 0.20.0 do not work with those versions.

Functions listed on the reference (for example `jubjubSchnorrSign`, `jubjubSchnorrVerifyingKey`, `sampleJubjubSchnorrSk`) are not exported by 0.16.0. Importing them on the supported stack fails with a TypeScript "has no exported member" error. Published packages confirm 0.16.0 lacks them while 0.19.0 and 0.20.0 include them.

This lab pins Compact ~0.31.1 / language ~0.23, compact-runtime 0.16.0, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. It does not invent APIs. Prefer the matrix and the 0.16.0 surface until the networks move to ledger 9.

Suggested upstream fix (from the issue): generate the reference from the runtime that toolchain 0.31.1 ships (0.16.0), or add a banner stating the reference is for ledger 9 / 0.34.0+ toolchains with a link to the matrix. The same applies to other Compact references that track main.

This note does not edit midnight-docs. It cites the open issue so lab consumers stay on the compatible pin.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
