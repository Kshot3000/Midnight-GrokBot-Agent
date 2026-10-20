# Compact runtime API reference mismatch (0.20.0 published, 0.16.0 on networks)

Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1564

midnight-docs#1564 reports that the Compact runtime API reference documents `@midnight-ntwrk/compact-runtime` v0.20.0. That is the ledger 9 line. Preview, Preprod, and Mainnet run ledger 8. The support matrix pairs those networks with Compact toolchain 0.31.1 and Compact runtime 0.16.0. Runtimes 0.19.0 and 0.20.0 do not work with the versions in the matrix.

This lab note only records the mismatch and the pin. It does not edit midnight-docs, claim a public indexer or node fix, or invent APIs. Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Official docs only: https://docs.midnight.network/.

## What the official pages say

Checked live on 2026-10-20:

- API reference root: https://docs.midnight.network/api-reference/compact-runtime — header **@midnight-ntwrk/compact-runtime v0.20.0**.
- Support matrix: https://docs.midnight.network/relnotes/support-matrix — Compact runtime 0.16.0 for the public networks; Compact toolchain 0.31.1.
- Known incompatible combinations on the same page: Compact runtime 0.19.0 or 0.20.0 with Midnight.js 4.1.1 fails (Midnight.js 4.1.1 pins compact-runtime to 0.16.0). Toolchain 0.31.1 with runtime 0.19.0/0.20.0 throws a version mismatch expecting 0.16.0.

Functions such as `jubjubSchnorrSign` appear on the 0.20.0 reference. They are not exported by 0.16.0, so a TypeScript project on the supported stack fails with "has no exported member".

## What builders should do

Stay on the matrix pin for current networks:

- `compact update 0.31` (toolchain ~0.31.1, language ~0.23)
- `@midnight-ntwrk/compact-runtime` 0.16.0
- midnight-js 4.1.1

Do not import the 0.20.0-only helpers while targeting Preview / Preprod / Mainnet. The generated contract `index.js` calls `checkRuntimeVersion('0.16.0')` for a 0.31.1 compile.

## Lab check

`packages/preprod-hello-stub/src/compact-runtime-pin.mjs` exports the matrix pin (0.16.0) and the published reference version (0.20.0), and rejects treating the published reference as the network runtime. `node --test test/compact-runtime-pin.test.mjs` covers it. LOCAL-TRUE. No deploy is claimed.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
