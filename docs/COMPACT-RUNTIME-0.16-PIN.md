# Compact runtime 0.16.0 pin vs published API reference

Upstream issue: https://github.com/midnightntwrk/midnight-docs/issues/1564

Official support matrix: https://docs.midnight.network/relnotes/support-matrix

## Summary

Preview, Preprod, and Mainnet run ledger 8. The compatibility matrix pairs them with:

- Compact toolchain 0.31.1 (language ~0.23)
- Compact runtime 0.16.0
- Midnight.js 4.1.1
- DApp Connector 4.0.1
- proof-server 8.1.x

The published Compact runtime API reference documents `@midnight-ntwrk/compact-runtime` v0.20.0 (ledger 9 line). Runtimes 0.19.0 and 0.20.0 do not work with the network versions above.

A developer following the API reference on the supported stack will see TypeScript errors for exports that exist only in 0.19.0+ (examples reported in the issue: `jubjubSchnorrSign`, `jubjubSchnorrVerifyingKey`, `sampleJubjubSchnorrSk`).

## What to do in this lab

- Pin Compact toolchain ~0.31.1 / language ~0.23.
- Pin `@midnight-ntwrk/compact-runtime` to 0.16.0 (or the version that Midnight.js 4.1.1 expects).
- Do not import ledger-9-only helpers from the 0.20.0 reference pages.
- Prefer the support matrix over the version shown in the API reference header until the networks move to ledger 9.

This lab does not invent APIs. It does not claim a fix of the public indexer, node, or upstream docs.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
