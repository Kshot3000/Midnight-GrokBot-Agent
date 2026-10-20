# Upstream open issues sweep (2026-10-20)

This lab read open issues in midnightntwrk/servicedesk, midnightntwrk/midnight-docs, and midnightntwrk/example-hello-world on 2026-10-20. It cannot push to those orgs. It does not claim any fix of the public indexer, node, faucet, proof server, or RPC path. Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Official docs only: https://docs.midnight.network/.

## midnightntwrk/servicedesk (open, newest first)

- [#257](https://github.com/midnightntwrk/servicedesk/issues/257) (updated 2026-10-20) — Mainnet contract deploys stay pending until TTL and are never included, while contract calls land (possible `--filter-deploy-txs` on the path to producers). Lab classifiers already exist: `docs/MAINNET-DEPLOY-PENDING.md` and `packages/preprod-hello-stub/src/deploy-pending-ttl-decode.mjs`. Official deploy path: https://docs.midnight.network/guides/deploy-and-operate. This lab does not claim the public node or producers are fixed. Prefer Preprod or a local network for deploy tests until operators confirm the flag is gone from the path to producers. Related: servicedesk#34 and MIP #361.
- [#254](https://github.com/midnightntwrk/servicedesk/issues/254) — Faucet `POST /drips` multiplies the requested `amount` by 5 tNIGHT. Lab: `docs/FAUCET-AMOUNT-UNIT.md`. Official funding page: https://docs.midnight.network/guides/acquire-tokens.
- [#252](https://github.com/midnightntwrk/servicedesk/issues/252) — proof-server 9.0.0-rc.9 DUST-spend proofs rejected by Stagenet node 2.0.0 with `1010: Invalid Transaction: Custom error: 170`. Lab pins proof-server 8.1.0; see `docs/DUST-SPEND-PROOF-170.md` and the Preprod decoder in `packages/preprod-hello-stub/src/rpc-errors.mjs`. Official error codes: https://docs.midnight.network/nodes/error-codes.
- [#251](https://github.com/midnightntwrk/servicedesk/issues/251) — Wallet SDK DUST sync never notices a subscription that stays open but stops delivering events. Lab notes already exist under `docs/DUST-SILENT-*` and `docs/PREPROD-WALLET-SYNC-STALL.md`.
- Template-review chores (#261, #260, #259) — overdue release-notes / post-mortem / announcement templates. Lab does not own those templates. Builders should re-check the live support matrix before any deploy: https://docs.midnight.network/relnotes/support-matrix.

## midnightntwrk/midnight-docs (open)

- [#1564](https://github.com/midnightntwrk/midnight-docs/issues/1564) — Compact runtime API reference documents 0.20.0, but Preview / Preprod / Mainnet run 0.16.0 (toolchain 0.31.1). Lab: `docs/COMPACT-RUNTIME-VERSION-MISMATCH.md`. Matrix note on incompatible combinations: https://docs.midnight.network/relnotes/support-matrix.
- [#1569](https://github.com/midnightntwrk/midnight-docs/issues/1569) — Wallet and connector pages contain stale lines against DApp Connector API 4.0.1 and Wallet SDK 1.2.0. Lab: `docs/WALLET-CONNECTOR-STALE-LINES.md`.
- [#1554](https://github.com/midnightntwrk/midnight-docs/issues/1554) — Missing guide for wallet builders (Wallet SDK plus implementing the DApp Connector API). Lab: `docs/WALLET-BUILDER-GUIDE-GAP.md`.

## midnightntwrk/example-hello-world (open)

- [#41](https://github.com/midnightntwrk/example-hello-world/issues/41) — unused `axios` and `testcontainers` dependencies. Lab: `docs/HELLO-WORLD-UNUSED-DEPS.md`.

This sweep only points at official pages and existing lab classifiers / notes. No new APIs are invented. LOCAL-TRUE notes only; no on-chain deploy is claimed. Do not treat a Valid `validate_transaction` + pending pool as proof a mainnet deploy will be included (#257).

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
