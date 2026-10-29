# Compact runtime API documents 0.20.0; networks run 0.16.0 (midnight-docs#1564)

Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1564

Official docs:
- https://docs.midnight.network/relnotes/support-matrix
- https://docs.midnight.network/guides/compact-javascript-runtime
- https://docs.midnight.network/relnotes/compact/toolchain-0.31.1
- https://docs.midnight.network/how-to/fix-version-mismatches

## Reported gap

The Compact runtime API reference documents `@midnight-ntwrk/compact-runtime` v0.20.0 (ledger 9). Preview, Preprod, and Mainnet run ledger 8. The [support matrix](https://docs.midnight.network/relnotes/support-matrix) pairs them with Compact toolchain 0.31.1 and Compact runtime 0.16.0.

Functions present only on 0.19.0 / 0.20.0 (for example `jubjubSchnorrSign`, `jubjubSchnorrVerifyingKey`, `sampleJubjubSchnorrSk`) are listed in the reference but are not exported by 0.16.0. Importing them on the supported stack fails with a TypeScript "has no exported member" error.

The matrix also records the exact import-time mismatch strings:

- Compact toolchain 0.34.0 / 0.35.0 with runtime 0.16.0 → `Version mismatch: compiled code expects 0.19.0, runtime is 0.16.0` (0.20.0 for 0.35.0)
- Compact toolchain 0.31.1 with runtime 0.19.0 / 0.20.0 → `Version mismatch: compiled code expects 0.16.0, runtime is 0.20.0`

## What to do on the supported stack

Pin both sides to the matrix:

```bash
compact update 0.31.1
npm install @midnight-ntwrk/compact-runtime@0.16.0
```

Generated contracts from toolchain 0.31.1 call `checkRuntimeVersion('0.16.0')` at import. A mismatched runtime throws before any circuit runs.

## Lab artifact

`packages/preprod-hello-stub/src/runtime-version-mismatch-decode.mjs` classifies the official mismatch message and points at the matrix. It does not call a node, indexer, or proof server.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This lab note does not change upstream docs or claim a fix of the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
