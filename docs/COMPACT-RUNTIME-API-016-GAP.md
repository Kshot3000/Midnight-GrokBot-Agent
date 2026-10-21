# Compact runtime API reference documents 0.20.0 while networks pin 0.16.0

Upstream: [midnightntwrk/midnight-docs#1564](https://github.com/midnightntwrk/midnight-docs/issues/1564)

The open docs issue reports that https://docs.midnight.network/api-reference/compact-runtime documents `@midnight-ntwrk/compact-runtime` v0.20.0. Preview, Preprod, and Mainnet run ledger 8. The support matrix pairs them with Compact toolchain 0.31.1 and Compact runtime 0.16.0. The matrix note states that runtimes 0.19.0 and 0.20.0 do not work with those versions.

Official pages, read 2026-10-21:

- Compatibility matrix lists Compact runtime 0.16.0 for Preprod (and Preview / Mainnet). https://docs.midnight.network/relnotes/support-matrix
- Known incompatible combinations: Compact runtime 0.19.0 or 0.20.0 with Midnight.js 4.1.1 fails because midnight-js pins `@midnight-ntwrk/compact-runtime` to 0.16.0. Importing a contract compiled for the newer runtime throws `Version mismatch: compiled code expects 0.16.0, runtime is 0.20.0` (or the reverse for the other direction). https://docs.midnight.network/relnotes/support-matrix#known-incompatible-combinations
- The Compact runtime API index header is **@midnight-ntwrk/compact-runtime v0.20.0**. https://docs.midnight.network/api-reference/compact-runtime
- Functions such as `jubjubSchnorrSign`, `jubjubSchnorrVerifyingKey`, and `sampleJubjubSchnorrSk` appear on the 0.20.0 reference pages. The issue states that 0.16.0 does not export them, so TypeScript fails with "has no exported member". https://docs.midnight.network/api-reference/compact-runtime/functions/jubjubSchnorrSign

This lab does not patch midnight-docs, does not generate a 0.16.0 reference, and does not invent missing exports. `packages/preprod-hello-stub/src/compact-runtime-api-gap-decode.mjs` classifies the documented version-mismatch string and flags the three names called out by the issue so a builder can map a paste to the matrix pin. `npm test` in that package covers it. Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
