# Compact runtime version mismatch on ledger 8 networks

Upstream: [midnightntwrk/midnight-docs#1564](https://github.com/midnightntwrk/midnight-docs/issues/1564)

Official references:

- https://docs.midnight.network/relnotes/support-matrix (Preview / Preprod / Mainnet matrices and Known incompatible combinations)
- https://docs.midnight.network/guides/compact-javascript-runtime (Errors from the generated module)
- https://docs.midnight.network/relnotes/compact/toolchain-0.31.1

The Compact runtime API reference on docs.midnight.network currently documents `@midnight-ntwrk/compact-runtime` v0.20.0. That is the ledger 9 line. Preview, Preprod, and Mainnet run ledger 8 and pair Compact toolchain 0.31.1 with Compact runtime 0.16.0. Runtimes 0.19.0 and 0.20.0 do not work with those networks.

Importing generated code checks the runtime:

```js
import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.16.0');
```

Known mismatch messages from the support matrix:

| Combination | Error on import |
|---|---|
| Toolchain 0.31.1 (expects 0.16.0) with runtime 0.19.0 or 0.20.0 | `Version mismatch: compiled code expects 0.16.0, runtime is 0.19.0` (or `0.20.0`) |
| Toolchain 0.34.0 / 0.35.0 (expects 0.19.0 / 0.20.0) with runtime 0.16.0 | `Version mismatch: compiled code expects 0.19.0, runtime is 0.16.0` (0.20.0 for 0.35.0) |

Pin both sides from the matrix: `compact update 0.31.1` and `npm install @midnight-ntwrk/compact-runtime@0.16.0`. A bare `compact update` or an unpinned `npm install` can pull the ledger 9 line.

Lab decoder: `packages/preprod-hello-stub/src/compact-runtime-version-decode.mjs` maps these messages to the matrix pairs. Lab note: `contracts/hello-midnight/runtime-version-note.compact`.

This lab does not claim a fix of the public docs, API reference, compiler, indexer, or node. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
