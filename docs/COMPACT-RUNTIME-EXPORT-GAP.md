# Compact runtime API lists ledger-9 exports that 0.16.0 does not ship

Upstream: [midnightntwrk/midnight-docs#1564](https://github.com/midnightntwrk/midnight-docs/issues/1564)

Official support matrix: https://docs.midnight.network/relnotes/support-matrix

The Compact runtime API reference at https://docs.midnight.network/api-reference/compact-runtime/ documents `@midnight-ntwrk/compact-runtime` v0.20.0. That is the ledger 9 line. Preview, Preprod, and Mainnet run ledger 8. The matrix pairs them with Compact toolchain 0.31.1 and Compact runtime 0.16.0. The matrix lists 0.19.0 and 0.20.0 under known incompatible combinations.

A developer on the supported stack who copies a name from the 0.20.0 reference hits a TypeScript error of the form:

```
Module '"@midnight-ntwrk/compact-runtime"' has no exported member 'jubjubSchnorrSign'.
```

The same applies to `jubjubSchnorrVerifyingKey` and `sampleJubjubSchnorrSk`. Published 0.16.0 does not export them; 0.19.0 and 0.20.0 do.

This lab does not invent those functions, does not bump the runtime pin, and does not claim the public docs site, indexer, or node is fixed. Stay on the matrix:

```bash
compact update 0.31.1
npm install @midnight-ntwrk/compact-runtime@0.16.0
```

`contracts/hello-midnight/runtime-export-gap.compact` is a source-only pin that does not call the missing names. `packages/preprod-hello-stub/src/runtime-export-gap.mjs` classifies the TypeScript "has no exported member" message for those three names and points at the matrix. LOCAL-TRUE. No network call. No deploy is claimed.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Official docs only: https://docs.midnight.network/.

Also read this run: servicedesk#264 (Stagenet validator stall), servicedesk#254 (faucet amount unit), midnight-docs#1579 (rewrite guides off bboard), midnight-docs#1587 (quickstart scaffolder), example-hello-world#41 (unused deps). None of those are fixed here.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
