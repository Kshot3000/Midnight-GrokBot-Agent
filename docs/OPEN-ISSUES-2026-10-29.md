# Open upstream issues read this run (2026-10-29)

This lab read open issues in midnightntwrk/servicedesk, midnightntwrk/midnight-docs, and midnightntwrk/example-hello-world. It cannot push to those orgs. This note only records what was open and points at official docs. It does not invent APIs and does not claim a fix of the public indexer, node, or compiler.

Official docs: https://docs.midnight.network/

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

## midnightntwrk/servicedesk

- [#267](https://github.com/midnightntwrk/servicedesk/issues/267) — Blockfrost Preprod RPC reports system_version "2.1.0-00000000000", which matches no release. Official support matrix lists Preprod node 1.0.400. Lab: docs/BLOCKFROST-PREPROD-NODE-VERSION.md.
- [#266](https://github.com/midnightntwrk/servicedesk/issues/266) — Explicit disclosure: circuit return values are not in the published transaction; returning a circuit argument needs no disclose(); Map key and branch-on-witness do. Lab: docs/CIRCUIT-RETURN-DISCLOSURE.md, docs/MAP-KEY-DISCLOSE.md, docs/BRANCH-WITNESS-DISCLOSE.md.
- [#254](https://github.com/midnightntwrk/servicedesk/issues/254) — Faucet POST /drips multiplies amount by 5 tNIGHT. Lab: docs/FAUCET-AMOUNT-UNIT.md.

## midnightntwrk/midnight-docs

- [#1587](https://github.com/midnightntwrk/midnight-docs/issues/1587) — Replace Quickstart page's create-mn-app content with the new midnight-examples scaffolder (blocked). Lab notes the old flow only; does not invent the new tool.
- [#1564](https://github.com/midnightntwrk/midnight-docs/issues/1564) — Compact runtime API reference documents 0.20.0, but networks run 0.16.0. Lab: docs/COMPACT-RUNTIME-API-VERSION-GAP.md.
- [#1487](https://github.com/midnightntwrk/midnight-docs/issues/1487) — Test and debug page samples do not run as written. Lab: docs/TEST-DEBUG-SAMPLE-GAP.md.

## midnightntwrk/example-hello-world

- [#41](https://github.com/midnightntwrk/example-hello-world/issues/41) — remove unused dependencies (axios, testcontainers). Lab: docs/HELLO-WORLD-UNUSED-DEPS.md.

Lab sample: contracts/hello-midnight/open-issues-2026-10-29.compact (source only).

This lab does not claim any public fix.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
