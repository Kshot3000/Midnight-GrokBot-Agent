# Latest open upstream issues sweep (2026-10-19, wallet connector stale lines)

This lab read open issues in the three orgs it cannot push to. It does not claim any public indexer, node, or compiler fix. Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Official docs only: https://docs.midnight.network/.

## midnightntwrk/servicedesk (open)
- [#257](https://github.com/midnightntwrk/servicedesk/issues/257) — Mainnet contract deploys stay pending until TTL and are never included, while contract calls land (possible --filter-deploy-txs on the path to producers). Lab does not claim a public node or indexer fix.
- [#254](https://github.com/midnightntwrk/servicedesk/issues/254) — faucet POST /drips multiplies amount by 5 tNIGHT. Lab: `docs/FAUCET-AMOUNT-UNIT.md`, `packages/preprod-hello-stub/src/faucet-amount-unit.mjs`.
- [#252](https://github.com/midnightntwrk/servicedesk/issues/252) — proof-server 9.0.0-rc.9 DUST-spend proofs rejected by Stagenet node 2.0.0 with 1010 Custom error 170 (InvalidDustSpendProof). Lab pins proof-server 8.1.0; classifier in `docs/DUST-SPEND-PROOF-170.md` and `packages/preprod-hello-stub/src/dust-spend-proof-170-decode.mjs`.
- [#251](https://github.com/midnightntwrk/servicedesk/issues/251) — Wallet SDK DUST sync never notices a subscription that stays open but stops delivering events. Lab: `docs/DUST-SILENT-SUBSCRIPTION.md`, `packages/preprod-hello-stub/src/dust-silent-subscription.mjs`.

## midnightntwrk/midnight-docs (open)

- [#1569](https://github.com/midnightntwrk/midnight-docs/issues/1569) — Wallet and connector pages: stale lines found in the wallet guide review (payFees on submitTransaction, capitalized network IDs, missing apiVersion filter, sealed vs unsealed). Lab: `docs/WALLET-CONNECTOR-STALE-LINES.md`.
- [#1564](https://github.com/midnightntwrk/midnight-docs/issues/1564) — Compact runtime API reference documents 0.20.0, but the networks run 0.16.0. Lab: `docs/COMPACT-RUNTIME-API-VERSION-GAP.md`.
- [#1554](https://github.com/midnightntwrk/midnight-docs/issues/1554) — missing guide for wallet builders (Wallet SDK + implementing the DApp Connector API). Lab: `docs/WALLET-BUILDER-GUIDE-GAP.md`.
- [#1487](https://github.com/midnightntwrk/midnight-docs/issues/1487) — Test and debug page samples do not run as written. Lab: `docs/CIRCUIT-CONTEXT-PIN.md`, `contracts/hello-midnight/circuit-context-pin.compact`, `packages/preprod-hello-stub/src/circuit-context-pin.mjs`.
- [#1383](https://github.com/midnightntwrk/midnight-docs/issues/1383) — Document proving topology: local vs wallet-delegated vs hosted. Lab: `docs/PROVING-TOPOLOGY.md`.
- [#1396](https://github.com/midnightntwrk/midnight-docs/issues/1396) — Sunset Academy and make Hello World the main quick start. Lab: `docs/HELLO-WORLD-QUICKSTART-GAP.md`.

## midnightntwrk/example-hello-world (open)

- [#41](https://github.com/midnightntwrk/example-hello-world/issues/41) — unused axios and testcontainers dependencies. Lab: `docs/HELLO-WORLD-UNUSED-DEPS.md`.

This sweep does not invent APIs. It only points builders at the official pages and the lab’s local classifiers.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
