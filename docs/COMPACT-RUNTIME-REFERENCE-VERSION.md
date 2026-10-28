# Compact runtime API reference documents 0.20.0, but networks run 0.16.0

Upstream: [midnightntwrk/midnight-docs#1564](https://github.com/midnightntwrk/midnight-docs/issues/1564)

Official:

- https://docs.midnight.network/relnotes/support-matrix
- https://docs.midnight.network/api-reference/compact-runtime/

The Compact runtime API reference on docs.midnight.network documents `@midnight-ntwrk/compact-runtime` v0.20.0 (ledger 9 line). Preview, Preprod, and Mainnet all run ledger 8, and the support matrix pairs them with Compact toolchain 0.31.1 and Compact runtime 0.16.0. Runtimes 0.19.0 and 0.20.0 do not work with those network versions.

A reader on the supported stack can see functions such as `jubjubSchnorrSign`, `jubjubSchnorrVerifyingKey`, and `sampleJubjubSchnorrSk` on the reference pages, but 0.16.0 does not export them. TypeScript then fails with "has no exported member".

This lab note does not invent APIs, does not claim a fix of the public docs, indexer, or node, and does not change any reference generation. It only records the mismatch for builders pinned to Compact ~0.31.1 / language ~0.23 and midnight-js 4.1.1.

Use the support matrix as the source of truth for which runtime matches the network. Prefer imports that exist in 0.16.0 until the networks move to ledger 9.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
