# Upstream open issues snapshot (2026-10-15)

This run read open issues in midnightntwrk/servicedesk, midnightntwrk/midnight-docs, and midnightntwrk/example-hello-world. This lab cannot push to those orgs. Official source of truth remains https://docs.midnight.network/. Do not invent APIs. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This note does not claim any fix of the public indexer, node, or proof-server image. It only helps builders locate the open upstream reports and the corresponding lab workarounds in docs/ and packages/preprod-hello-stub/.

## midnightntwrk/servicedesk (open)

- [#252](https://github.com/midnightntwrk/servicedesk/issues/252) — proof-server 9.0.0-rc.9 DUST-spend proofs rejected by Stagenet node 2.0.0 with 1010 Custom error 170 (InvalidDustSpendProof). Workaround: stay on a tested tag (lab pin 8.1.0) or rc.5. Lab: docs/DUST-SPEND-PROOF-170.md, packages/preprod-hello-stub/src/dust-spend-proof-170-decode.mjs and rpc-errors.mjs (maps 170).
- [#251](https://github.com/midnightntwrk/servicedesk/issues/251) — Wallet SDK DUST sync never notices a subscription that stays open but stops delivering events. Lab: docs/DUST-SILENT-SUBSCRIPTION.md and dust-sync-silent.mjs.
- [#249](https://github.com/midnightntwrk/servicedesk/issues/249) — pure circuits in contract types compile but every call is refused (PureInterfaceCircuit); CoIP 4 omits the kind. Lab: contracts/hello-midnight/no-pure-interface.compact and pure-interface tests.
- [#243](https://github.com/midnightntwrk/servicedesk/issues/243) — midnight-js proof provider drops the proof server's error message and reports a timeout as "The user aborted a request." Lab: docs/PROOF-PROVIDER-ERROR-DROP.md and proof-provider-error-decode.mjs.
- [#242](https://github.com/midnightntwrk/servicedesk/issues/242) — proof-server image silently drops command-line flags and can exit if a key download fails three times. Lab: docs/PROOF-SERVER-FLAGS-DROP.md and proof-server-image-flags.mjs. Related midnight-docs#1527.
- [#236](https://github.com/midnightntwrk/servicedesk/issues/236) — midnight-js deploy construction fails with errors that do not name the cause when the contract's runtime differs. Lab: docs/RUNTIME-MISMATCH-DECODE.md.
- [#226](https://github.com/midnightntwrk/servicedesk/issues/226) — feature request: subset deploy and multi-insert verifier-key maintenance API. Lab: docs/SUBSET-DEPLOY-GAP.md.
- [#225](https://github.com/midnightntwrk/servicedesk/issues/225) — Node RPC 1010 "Transaction would exhaust the block limits" surfaces only as a generic "Transaction submission error". Lab: docs/PREPROD-BLOCK-LIMIT-NO-U8.md and rpc-errors.mjs.
- [#213](https://github.com/midnightntwrk/servicedesk/issues/213) — capture an allocated shielded-coin Merkle index without persisting the full coin. Lab: contracts/hello-midnight/coin-index-gap.compact.
- [#202](https://github.com/midnightntwrk/servicedesk/issues/202) — callee contracts cannot read their caller (kernel.caller undefined). Lab: docs/CALLEE-CALLER-GAP.md and explicit-callee.compact.
- [#194](https://github.com/midnightntwrk/servicedesk/issues/194) — WalletFacade balance/finalization pins CPU and grows RSS before submission. Lab: docs/WALLET-BALANCE-CPU-PIN.md.
- [#193](https://github.com/midnightntwrk/servicedesk/issues/193) — Faucet server crashes on bare "/api" request. Lab: docs/FAUCET-BARE-API-CRASH.md.
- [#186](https://github.com/midnightntwrk/servicedesk/issues/186) — TransactionResult.successfulSegments is inverted (true marks FAILED segments). Lab: docs/SUCCESSFUL-SEGMENTS-INVERTED.md.
- [#117](https://github.com/midnightntwrk/servicedesk/issues/117) — Contract unshielded-token ops rejected by FeeCalculation(OutsideTimeToDismiss) (Custom error 231). Lab: docs/UNSHIELDED-DISMISS.md and rpc-errors.mjs.
- [#99](https://github.com/midnightntwrk/servicedesk/issues/99) — WalletFacade.initSwap returns partial transactions for mixed shielded/unshielded swaps. Lab: docs/MIXED-SWAP-LEG.md.
- Other open: #205 / #204 review requests, #197 Cloudflare help, dependency dashboard #24. Not builder-path fixes.

Official error tables used by the lab decoder: https://docs.midnight.network/nodes/error-codes and the 1010 how-to. 170 is InvalidDustSpendProof; 171 is OutOfDustValidityWindow; 196 is DustDoubleSpend.

## midnightntwrk/midnight-docs (open)

- [#1554](https://github.com/midnightntwrk/midnight-docs/issues/1554) — Add a guide for wallet builders (Wallet SDK plus implementing the DApp Connector API). Lab: docs/WALLET-BUILDER-GUIDE-GAP.md. Official: wallet-dev-guide and dapp-connector API reference (pin 4.0.1).
- [#1527](https://github.com/midnightntwrk/midnight-docs/issues/1527) — proof-server docker run and Compose commands silently drop flags (-v, --network, --port). Use environment variables. Lab: docs/PROOF-SERVER-DOCKER-FLAGS.md. Related servicedesk#242.
- [#1487](https://github.com/midnightntwrk/midnight-docs/issues/1487) — Test and debug page samples do not run as written against Compact runtime 0.16.0 / midnight-js 4.1.1. Lab: docs/TEST-DEBUG-SAMPLE-GAP.md and CIRCUIT-CONTEXT-SAMPLE.md.
- [#1396](https://github.com/midnightntwrk/midnight-docs/issues/1396) — Sunset Midnight Academy links and expand Hello World into the main quick start.
- [#1383](https://github.com/midnightntwrk/midnight-docs/issues/1383) — Document proving topology (local vs wallet-delegated vs hosted). Privacy: never send witnesses to a third-party proof server. Lab notes in proving-topology docs.
- [#1380](https://github.com/midnightntwrk/midnight-docs/issues/1380) — Node.js server-side wallet guide (seed to synced wallet to deploy). Lab: docs/NODE-SEED-WALLET-GUIDE-GAP.md.
- [#1386](https://github.com/midnightntwrk/midnight-docs/issues/1386) — AEO baseline: description frontmatter and llms.txt link index. Lab: docs/AEO-LLMS-INDEX-GAP.md.
- [#1092](https://github.com/midnightntwrk/midnight-docs/issues/1092) — Aura to BABE docs update. Lab: docs/AURA-BABE-DOC-GAP.md.
- Other open: examples coverage (#1163), EffectStream follow-up (#1245), MerkleTree.insert vs insertHash (#63), own indexer guide (#285), Wallet SDK API reference (#831), stale testnet-02 refs (#1172), dependency dashboard.

## midnightntwrk/example-hello-world (open)

- [#41](https://github.com/midnightntwrk/example-hello-world/issues/41) — Remove unused dependencies axios and testcontainers.
- [#13](https://github.com/midnightntwrk/example-hello-world/issues/13) — Dependency dashboard. Lab stays pinned to midnight-js 4.1.1, proof-server 8.1.0, Compact ~0.31.1 / language ~0.23, DApp Connector 4.0.1.

Builders should prefer the official support matrix for any version choice: https://docs.midnight.network/relnotes/support-matrix.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
