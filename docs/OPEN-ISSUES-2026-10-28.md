# Open issues read 2026-10-28

This lab read open issues in midnightntwrk/servicedesk, midnightntwrk/midnight-docs, and midnightntwrk/example-hello-world. It cannot push to those orgs. This note does not claim a fix of the public indexer, node, or compiler. Official docs only: https://docs.midnight.network/. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

## servicedesk (selected open)

- [#267](https://github.com/midnightntwrk/servicedesk/issues/267) — Which node build does Blockfrost preprod RPC run? It reports "2.1.0-00000000000", which matches no release. Lab note: docs/BLOCKFROST-PREPROD-NODE-VERSION.md
- [#266](https://github.com/midnightntwrk/servicedesk/issues/266) — Explicit disclosure: circuit return values are not in the published transaction, and returning a circuit argument needs no disclose(). Lab notes: docs/CIRCUIT-RETURN-DISCLOSURE.md, docs/EXPLICIT-DISCLOSURE-RETURN.md, contracts/hello-midnight/return-disclosure.compact and related.
- [#254](https://github.com/midnightntwrk/servicedesk/issues/254) — Faucet POST /drips multiplies amount by 5 tNIGHT. Lab: docs/FAUCET-AMOUNT-UNIT.md
- [#252](https://github.com/midnightntwrk/servicedesk/issues/252) — proof-server 9.0.0-rc.9 DUST-spend proofs rejected by Stagenet node 2.0.0 (1010 Custom error 170). Lab: docs/DUST-SPEND-PROOF-170.md
- [#251](https://github.com/midnightntwrk/servicedesk/issues/251) — Wallet SDK DUST sync never notices a subscription that stays open but stops delivering events. Lab: docs/DUST-SILENT-SUBSCRIPTION.md

## midnight-docs (selected open)

- [#1587](https://github.com/midnightntwrk/midnight-docs/issues/1587) — Replace the Quickstart page's create-mn-app content with the new midnight-examples scaffolder (blocked). Lab: docs/QUICKSTART-CREATE-MN-APP-GAP.md
- [#1569](https://github.com/midnightntwrk/midnight-docs/issues/1569) — Wallet and connector pages: stale lines. Lab: docs/DAPP-CONNECTOR-STALE-DECODE.md and related.
- [#1564](https://github.com/midnightntwrk/midnight-docs/issues/1564) — Compact runtime API reference documents 0.20.0, but the networks run 0.16.0. Lab: docs/COMPACT-RUNTIME-API-VERSION-GAP.md
- [#1487](https://github.com/midnightntwrk/midnight-docs/issues/1487) — Test and debug page: code samples don't run as written. Lab: docs/CIRCUIT-CONTEXT-SAMPLE.md
- [#1383](https://github.com/midnightntwrk/midnight-docs/issues/1383) — Document proving topology. Lab: docs/PROVING-TOPOLOGY.md
- [#1381](https://github.com/midnightntwrk/midnight-docs/issues/1381) — Add a troubleshooting page for wallet sync stalls on Preprod. Lab: docs/PREPROD-WALLET-SYNC-STALL.md

## example-hello-world (open)

- [#41](https://github.com/midnightntwrk/example-hello-world/issues/41) — chore: remove unused dependencies (axios, testcontainers). Lab: docs/HELLO-WORLD-UNUSED-DEPS.md
- [#13](https://github.com/midnightntwrk/example-hello-world/issues/13) — Dependency Dashboard (Renovate).

This snapshot is for builders on the pinned stack. Prefer the lab Compact samples and preprod-hello-stub classifiers over inventing APIs. Does not claim a fix of the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
