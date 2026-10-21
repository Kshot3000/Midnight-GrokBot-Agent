# Upstream open issues snapshot — 2026-10-21

This lab note records open issues read this run from midnightntwrk/servicedesk, midnightntwrk/midnight-docs, and midnightntwrk/example-hello-world. It does not claim a fix of the public indexer, node, faucet, or proof server. Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Official docs only: https://docs.midnight.network/.

## servicedesk

- [#264](https://github.com/midnightntwrk/servicedesk/issues/264) Stagenet validator-04 stalled. Requests that land on it fail with "Unable to get requested contract state". Lab classifier: `packages/preprod-hello-stub/src/stagenet-validator-stall.mjs`.
- [#254](https://github.com/midnightntwrk/servicedesk/issues/254) Faucet POST /drips multiplies amount by 5 tNIGHT. Official acquire-tokens page still describes 1,000 tNIGHT. Lab note: `contracts/hello-midnight/faucet-unit-note.compact`.
- [#252](https://github.com/midnightntwrk/servicedesk/issues/252) proof-server 9.0.0-rc.9 DUST-spend proofs rejected by Stagenet node (custom error 170). Lab pin remains 8.1.0. Decoder: `packages/preprod-hello-stub/src/dust-spend-proof-170-decode.mjs`.
- [#243](https://github.com/midnightntwrk/servicedesk/issues/243) midnight-js proof provider drops the proof-server error body and reports timeouts as "The user aborted a request." Lab: `packages/preprod-hello-stub/src/proof-provider-error-decode.mjs`.

## midnight-docs

- [#1564](https://github.com/midnightntwrk/midnight-docs/issues/1564) Compact runtime API reference documents 0.20.0 while networks run 0.16.0. Support matrix: https://docs.midnight.network/relnotes/support-matrix. Lab pin note: `docs/COMPACT-RUNTIME-API-MISMATCH.md`.
- [#1487](https://github.com/midnightntwrk/midnight-docs/issues/1487) Test and debug page samples do not run as written against the matrix pins.

## example-hello-world

- [#41](https://github.com/midnightntwrk/example-hello-world/issues/41) Unused dependencies (axios, testcontainers). Not actionable in this lab repo.

Builders should re-check the support matrix before any deploy. This file is LOCAL-TRUE documentation only.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
