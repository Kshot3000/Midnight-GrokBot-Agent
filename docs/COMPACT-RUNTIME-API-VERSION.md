# Compact runtime API reference is 0.20.0; networks pin 0.16.0

Upstream: [midnightntwrk/midnight-docs#1564](https://github.com/midnightntwrk/midnight-docs/issues/1564)

Official references:

- Compatibility matrix: https://docs.midnight.network/relnotes/support-matrix — Compact runtime **0.16.0** for Preview, Preprod, and Mainnet (with Compact toolchain 0.31.1 and Midnight.js 4.1.1).
- Compact runtime API reference: https://docs.midnight.network/api-reference/compact-runtime — currently documents **@midnight-ntwrk/compact-runtime v0.20.0**.
- The matrix notes that runtimes 0.19.0 and 0.20.0 do not work with Midnight.js 4.1.1 (which pins compact-runtime 0.16.0 and onchain-runtime-v3 3.0.0). Importing a 0.31.1-compiled contract against 0.19/0.20 raises a version mismatch expecting 0.16.0.

Issue #1564 reports that functions such as `jubjubSchnorrSign`, `jubjubSchnorrVerifyingKey`, and `sampleJubjubSchnorrSk` appear in the 0.20.0 reference but are absent from the published 0.16.0 package. Builders on the supported ledger-8 stack therefore see TypeScript errors for members the reference lists.

This lab does not edit midnight-docs, does not claim the public API reference is fixed, and does not invent exports. Lab helper `packages/preprod-hello-stub/src/compact-runtime-api-version.mjs` only records the official pin and the reported mismatch. It does not import `@midnight-ntwrk/compact-runtime` and does not call any runtime function.

Pins used by this lab: Compact ~0.31.1 / language ~0.23, compact-runtime 0.16.0, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
