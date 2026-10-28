# Compact runtime 0.16.0 export gap for Schnorr helpers (midnight-docs#1564)

Upstream issue: [midnightntwrk/midnight-docs#1564](https://github.com/midnightntwrk/midnight-docs/issues/1564)

Official docs only (read 2026-10-28):

- Support matrix: https://docs.midnight.network/relnotes/support-matrix — Compact runtime 0.16.0 for Preprod, Preview, Mainnet
- Compact runtime API reference header: https://docs.midnight.network/api-reference/compact-runtime — documents v0.20.0
- Function pages for `jubjubSchnorrSign`, `jubjubSchnorrVerifyingKey`, `sampleJubjubSchnorrSk` exist under the 0.20.0 reference

The matrix note states runtimes 0.19.0 and 0.20.0 are incompatible with Midnight.js 4.1.1 (which pins compact-runtime 0.16.0). Importing the newer runtime produces a version-mismatch error. The three Schnorr helpers listed in the issue are not exported from 0.16.0.

This lab records the pin mismatch so builders stay on the matrix. It does not generate a 0.16.0 reference, does not invent missing exports, and does not patch midnight-docs.

Companion: `packages/preprod-hello-stub/src/compact-runtime-016-export-gap.mjs` classifies the "has no exported member" TypeScript error for those three names and the version-mismatch string.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
