# Compact runtime API reference documents 0.20.0 while networks run 0.16.0 (midnight-docs#1564)

Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1564

Official docs:
- https://docs.midnight.network/relnotes/support-matrix
- https://docs.midnight.network/guides/compact-javascript-runtime
- https://docs.midnight.network/api-reference/compact-runtime/

## Reported mismatch

The Compact runtime API reference documents `@midnight-ntwrk/compact-runtime` v0.20.0. That is the ledger 9 line.

The support matrix pairs Preview, Preprod, and Mainnet (all ledger 8) with Compact toolchain 0.31.1 and Compact runtime 0.16.0. Its note states that runtimes 0.19.0 and 0.20.0 do not work with those versions.

A developer on the supported stack therefore sees functions on the reference pages that 0.16.0 does not export (for example `jubjubSchnorrSign`, `jubjubSchnorrVerifyingKey`, and `sampleJubjubSchnorrSk`). Importing them fails with a TypeScript "has no exported member" error.

## Confirmed on the matrix

From https://docs.midnight.network/relnotes/support-matrix (as of the issue):

- Compact toolchain 0.31.1
- Compact runtime 0.16.0
- Midnight.js 4.1.1
- Known incompatible: Compact runtime 0.19.0 or 0.20.0 with Midnight.js 4.1.1; Compact toolchain 0.34.0 / 0.35.0 with runtime 0.16.0.

The JavaScript runtime guide also pins its samples to Compact toolchain 0.31.1 (language 0.23) and `@midnight-ntwrk/compact-runtime` 0.16.0.

## Lab note

This repository pins the same stack (Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0). Do not import symbols that exist only on 0.19.0 / 0.20.0 when targeting the current networks.

Suggested upstream fixes (from the issue):
- Generate the reference from the runtime that toolchain 0.31.1 ships (0.16.0) until the networks move to ledger 9, or
- Keep 0.20.0 and add a banner stating it is for ledger 9 and the 0.34.0+ toolchains, with a link to the matrix.

This lab note does not edit midnight-docs, does not invent APIs, and does not claim a fix of the public indexer, node, or docs site.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
