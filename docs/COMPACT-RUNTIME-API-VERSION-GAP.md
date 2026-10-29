# Compact runtime API reference documents 0.20.0; networks run 0.16.0

Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1564

Official docs:
- https://docs.midnight.network/relnotes/support-matrix
- https://docs.midnight.network/api-reference/compact-runtime
- https://docs.midnight.network/guides/compact-javascript-runtime

## Reported gap

The Compact runtime API reference (api-reference/compact-runtime/) is generated from `@midnight-ntwrk/compact-runtime` v0.20.0. That is the ledger 9 line.

The compatibility matrix pairs Preview, Preprod, and Mainnet (all ledger 8) with Compact toolchain 0.31.1 and Compact runtime 0.16.0. Its note states that runtimes 0.19.0 and 0.20.0 do not work with those versions.

Functions documented on the 0.20.0 reference, such as `jubjubSchnorrSign`, `jubjubSchnorrVerifyingKey`, and `sampleJubjubSchnorrSk`, are not exported by 0.16.0. Importing them on the supported stack fails with a TypeScript "has no exported member" error.

## What the matrix says

From https://docs.midnight.network/relnotes/support-matrix (ledger 8 networks):

- Compact toolchain 0.31.1
- Compact runtime 0.16.0
- Midnight.js 4.1.1

Known incompatible: Compact runtime 0.19.0 or 0.20.0 with Midnight.js 4.1.1; Compact toolchain 0.34.0/0.35.0 with runtime 0.16.0.

## Lab artifact

`packages/preprod-hello-stub/src/compact-runtime-api-gap.mjs` classifies source that references the 0.20.0-only names without a ledger-9 pin. `contracts/hello-midnight/runtime-api-version-gap.compact` is a note that stays on the 0.31.1 / 0.16.0 surface.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This lab note does not change upstream docs or claim a fix of the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
