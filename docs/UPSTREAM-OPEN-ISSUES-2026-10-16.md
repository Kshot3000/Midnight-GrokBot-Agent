# Upstream open issues snapshot (2026-10-16)

This run read open issues in midnightntwrk/servicedesk, midnightntwrk/midnight-docs, and midnightntwrk/example-hello-world. This lab cannot push to those orgs. Official source of truth remains https://docs.midnight.network/. Do not invent APIs. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This note does not claim any fix of the public indexer, node, faucet, or proof-server image. It only helps builders locate the open upstream reports and the corresponding lab notes in docs/ and packages/preprod-hello-stub/.

## midnightntwrk/servicedesk (open, newest first)

- [#254](https://github.com/midnightntwrk/servicedesk/issues/254) — Faucet POST /drips multiplies requested amount by 5 tNIGHT (TNIGHT_UNIT = 5_000_000n). Body `"amount": "1000"` registers 5,000 tNIGHT. Official docs still describe 1,000 tNIGHT. Lab: docs/FAUCET-AMOUNT-UNIT.md and packages/preprod-hello-stub/src/faucet-amount-unit.mjs (classify only; attempt-faucet.mjs now surfaces the classification). Does not contact or fix the public faucet.
- [#252](https://github.com/midnightntwrk/servicedesk/issues/252) — proof-server 9.0.0-rc.9 DUST-spend proofs rejected by Stagenet node 2.0.0 with 1010 Custom error 170. Lab pin remains proof-server 8.1.0. See docs/DUST-SPEND-PROOF-170.md.
- [#251](https://github.com/midnightntwrk/servicedesk/issues/251) — Wallet SDK DUST sync never notices a subscription that stays open but stops delivering events. Lab: docs/DUST-SILENT-SUBSCRIPTION.md.
- [#249](https://github.com/midnightntwrk/servicedesk/issues/249) — pure circuits in contract types compile but every call is refused (PureInterfaceCircuit). Lab: docs/PURE-INTERFACE-CIRCUIT.md.
- [#243](https://github.com/midnightntwrk/servicedesk/issues/243) — midnight-js proof provider drops the proof server's error message and reports a timeout as "The user aborted a request." Lab: docs/PROOF-PROVIDER-ERROR-DROP.md.
- [#242](https://github.com/midnightntwrk/servicedesk/issues/242) — proof-server image silently drops command-line flags. Lab: docs/PROOF-SERVER-FLAGS-DROP.md.
- [#236](https://github.com/midnightntwrk/servicedesk/issues/236) — midnight-js deploy construction fails with errors that do not name the cause when the contract's runtime differs. Lab: docs/RUNTIME-MISMATCH-DECODE.md.
- [#226](https://github.com/midnightntwrk/servicedesk/issues/226) — feature request: subset deploy and multi-insert verifier-key maintenance API. Lab: docs/SUBSET-DEPLOY-GAP.md.
- [#225](https://github.com/midnightntwrk/servicedesk/issues/225) — Node RPC 1010 "Transaction would exhaust the block limits" surfaces only as a generic "Transaction submission error". Lab: docs/SUBMISSION-1010-DECODE.md and related.
- [#213](https://github.com/midnightntwrk/servicedesk/issues/213) — Feature request: capture an allocated shielded-coin Merkle index without persisting the full coin value. Lab: docs/SHIELDED-INDEX-WITHOUT-VALUE.md and contracts/hello-midnight/coin-index-gap.compact.
- [#203](https://github.com/midnightntwrk/servicedesk/issues/203) — Prover keys of 90–570 MB per circuit make client-side proving impractical. Lab: docs/PROVER-KEY-WEIGHT.md.

## midnightntwrk/midnight-docs (open)

- [#1554](https://github.com/midnightntwrk/midnight-docs/issues/1554) — Add a guide for wallet builders (Wallet SDK + implementing the DApp Connector API). Lab: docs/WALLET-BUILDER-GUIDE-GAP.md.
- [#1487](https://github.com/midnightntwrk/midnight-docs/issues/1487) — Test and debug page samples do not run as written. Lab: docs/TEST-DEBUG-SAMPLE-GAP.md and CIRCUIT-CONTEXT-SAMPLE.md.
- [#1245](https://github.com/midnightntwrk/midnight-docs/issues/1245) — Follow-up review findings on EffectStream guides (compiler pin, disclose wording, relative links). Lab: docs/EFFECTSTREAM-COMPILER-PIN.md.
- Other open: proving topology (#1383), wallet sync stalls (#1381), Node.js server-side wallet guide (#1380), browser DApp lifecycle (#1379), AEO baseline (#1386), Hello World quick start (#1396).

## midnightntwrk/example-hello-world (open)

- [#41](https://github.com/midnightntwrk/example-hello-world/issues/41) — Remove unused dependencies axios and testcontainers.
- [#13](https://github.com/midnightntwrk/example-hello-world/issues/13) — Dependency dashboard. Lab stays pinned to midnight-js 4.1.1, proof-server 8.1.0, Compact ~0.31.1 / language ~0.23, DApp Connector 4.0.1.

Builders should prefer the official support matrix for any version choice: https://docs.midnight.network/relnotes/support-matrix.

This does not claim a fix of the public indexer, node, or faucet.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
