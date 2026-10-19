# Upstream open issues sweep (2026-10-19)

This lab read open issues in midnightntwrk/servicedesk, midnightntwrk/midnight-docs, and midnightntwrk/example-hello-world. It cannot push to those orgs. It does not claim any fix of the public indexer, node, faucet, or proof server. Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Official docs only: https://docs.midnight.network/.

## midnightntwrk/servicedesk (open, newest)

- [#261](https://github.com/midnightntwrk/servicedesk/issues/261), [#260](https://github.com/midnightntwrk/servicedesk/issues/260), [#259](https://github.com/midnightntwrk/servicedesk/issues/259) — chore: template review overdue (release-notes, post-mortem, announcement; 173 days). Lab does not own those templates. Builders should still re-check the live support matrix before deploy: https://docs.midnight.network/relnotes/support-matrix
- [#257](https://github.com/midnightntwrk/servicedesk/issues/257) — Mainnet contract deploys stay pending until TTL while contract calls land (possible `--filter-deploy-txs` on the path to producers). Lab: `docs/MAINNET-DEPLOY-PENDING.md`, `packages/preprod-hello-stub/src/deploy-pending-ttl-decode.mjs`. Official deploy path remains https://docs.midnight.network/guides/deploy-and-operate. Prefer Preprod or local for deploy tests until operators confirm the flag is gone.
- [#254](https://github.com/midnightntwrk/servicedesk/issues/254) — Faucet POST /drips multiplies amount by 5 tNIGHT. Lab: `docs/FAUCET-AMOUNT-UNIT.md`. Official funding page: https://docs.midnight.network/guides/acquire-tokens (hosted page confirms 5000 tNight).
- [#252](https://github.com/midnightntwrk/servicedesk/issues/252) — proof-server 9.0.0-rc.9 DUST-spend proofs rejected by Stagenet with 1010 Custom error 170. Lab pins 8.1.0; see `docs/DUST-SPEND-PROOF-170.md`.

## midnightntwrk/midnight-docs (open)

- [#1554](https://github.com/midnightntwrk/midnight-docs/issues/1554) — missing guide for wallet builders (Wallet SDK + DApp Connector implementer). Lab: `docs/WALLET-BUILDER-GUIDE-GAP.md`.
- [#1487](https://github.com/midnightntwrk/midnight-docs/issues/1487) — Test and debug page samples do not run as written. Lab: `docs/BBOARD-ASSERT-DECODE.md`, `docs/CIRCUIT-CONTEXT-PIN.md`.
- [#1396](https://github.com/midnightntwrk/midnight-docs/issues/1396) — Sunset Academy links; make Hello World the main quick start. Lab: `docs/HELLO-WORLD-QUICKSTART-GAP.md`.

## midnightntwrk/example-hello-world (open)

- [#41](https://github.com/midnightntwrk/example-hello-world/issues/41) — unused axios and testcontainers dependencies. Lab: `docs/HELLO-WORLD-UNUSED-DEPS.md`.

This sweep only points at official pages and existing lab classifiers. No new APIs are invented. LOCAL-TRUE notes only; no on-chain deploy is claimed.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
