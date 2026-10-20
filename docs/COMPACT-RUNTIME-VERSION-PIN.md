# Compact runtime version pin for public networks

Upstream: [midnightntwrk/midnight-docs#1564](https://github.com/midnightntwrk/midnight-docs/issues/1564)

Official: [Compatibility matrix](https://docs.midnight.network/relnotes/support-matrix) and [Compact runtime API](https://docs.midnight.network/api-reference/compact-runtime)

Preview, Preprod, and Mainnet run ledger 8. The support matrix pairs them with Compact toolchain 0.31.1 and Compact runtime 0.16.0. Runtimes 0.19.0 and 0.20.0 target ledger 9 and are listed under known incompatible combinations with Midnight.js 4.1.1.

The published Compact runtime API reference is generated for `@midnight-ntwrk/compact-runtime` v0.20.0. Functions that appear only on that reference (for example `jubjubSchnorrSign`, `jubjubSchnorrVerifyingKey`, and `sampleJubjubSchnorrSk`) are not exported by 0.16.0. Importing them on the supported stack fails TypeScript with "has no exported member".

This lab does not edit midnight-docs or claim the public reference is updated. Until the networks move to ledger 9, pin the runtime that the matrix lists:

```bash
compact update 0.31
npm install @midnight-ntwrk/compact-runtime@0.16.0
```

A bare `compact update` or an unversioned `npm install @midnight-ntwrk/compact-runtime` installs the newest (ledger-9) line and produces the version-mismatch errors documented on the matrix.

Pins used by this lab: Compact ~0.31.1 / language ~0.23, compact-runtime 0.16.0, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
