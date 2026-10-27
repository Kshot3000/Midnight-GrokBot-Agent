# Open issues read 2026-10-27

This lab read open issues in midnightntwrk/servicedesk, midnightntwrk/midnight-docs, and midnightntwrk/example-hello-world. It cannot push to those orgs. This note does not claim a fix of the public indexer, node, or compiler. Official docs only: https://docs.midnight.network/. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

## servicedesk (selected open)

- [#267](https://github.com/midnightntwrk/servicedesk/issues/267) — Which node build does Blockfrost preprod RPC run? It reports "2.1.0-00000000000", which matches no release. Lab note: docs/BLOCKFROST-PREPROD-NODE-VERSION.md
- [#266](https://github.com/midnightntwrk/servicedesk/issues/266) — Explicit disclosure: circuit return values are not in the published transaction, and returning a circuit argument needs no disclose(). Lab notes: docs/EXPLICIT-DISCLOSURE-RETURN.md, docs/COMPACT-RETURN-DISCLOSE-INVARIANT.md, contracts/hello-midnight/return-arg-no-disclose.compact and related samples.

## midnight-docs (selected open)

- [#1587](https://github.com/midnightntwrk/midnight-docs/issues/1587) — Replace the Quickstart page's create-mn-app content with the new midnight-examples scaffolder (blocked).
- [#1569](https://github.com/midnightntwrk/midnight-docs/issues/1569) — Wallet and connector pages: stale lines (payFees on submitTransaction, network IDs, apiVersion filter). Lab: docs/DAPP-CONNECTOR-STALE-LINES.md and related.
- [#1564](https://github.com/midnightntwrk/midnight-docs/issues/1564) — Compact runtime API reference documents 0.20.0, but the networks run 0.16.0. Lab: docs/COMPACT-RUNTIME-API-VERSION-GAP.md
- [#1487](https://github.com/midnightntwrk/midnight-docs/issues/1487) — Test and debug page: code samples don't run as written (CircuitContext, error strings, tx.wait, Counter retirement). Lab: docs/CIRCUIT-CONTEXT-PIN.md, docs/TEST-AND-DEBUG-SAMPLES-GAP.md and related Compact samples.
- [#1383](https://github.com/midnightntwrk/midnight-docs/issues/1383) — Document proving topology: local vs wallet-delegated vs hosted proof server.
- [#1381](https://github.com/midnightntwrk/midnight-docs/issues/1381) — Add a troubleshooting page for wallet sync stalls on Preprod.

## example-hello-world (open)

- [#41](https://github.com/midnightntwrk/example-hello-world/issues/41) — chore: remove unused dependencies (axios, testcontainers). Lab: docs/HELLO-WORLD-UNUSED-DEPS.md
- [#13](https://github.com/midnightntwrk/example-hello-world/issues/13) — Dependency Dashboard (Renovate).

This snapshot is for builders on the pinned stack. Prefer the lab Compact samples and preprod-hello-stub classifiers over inventing APIs.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
