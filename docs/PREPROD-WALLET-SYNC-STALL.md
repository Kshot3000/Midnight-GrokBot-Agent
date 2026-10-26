# Preprod wallet sync stalls: what isSynced gates on

Upstream: [midnightntwrk/midnight-docs#1381](https://github.com/midnightntwrk/midnight-docs/issues/1381)

Official pages (do not invent):

- Support matrix: https://docs.midnight.network/relnotes/support-matrix — Preprod Wallet SDK 1.2.0, Midnight.js 4.1.1, Indexer 4.3.302 (note: no public tag yet), Node 1.0.400
- Wallet developer guide: https://docs.midnight.network/sdks/official/wallet-dev-guide
- Local proving (network table): https://docs.midnight.network/guides/local-proving — Preprod is the live pre-production network for final testing

midnight-docs#1381 tracks the missing troubleshooting page for wallet synchronization stalling on Preprod. Reported symptoms include `waitForSyncedState()` never resolving, `FacadeState.isSynced` staying false, the shielded wallet sync leg never connecting, and dust-wallet sync errors about non-linear inserts into the dust commitment tree.

This lab note only records the gap and a classifier for the reported symptoms. It does not edit midnight-docs, does not call a public indexer or node, and does not claim a fix.

## What builders hit on Preprod

From the issue (Kapa traffic 7 Aug–21 Sep 2026):

- Wallet creation succeeds; synchronization starts; then hangs on Preprod (local undeployed works).
- `waitForSyncedState()` expected duration and dust-channel gating in wallet-sdk 1.2.0.
- Shielded wallet sync leg never connects or issues subscriptions, so `isSynced` never becomes true.
- Dust wallet sync process inserts non-linearly into the dust commitment tree (expected index vs received).
- WalletFacade + HDWallet never becomes isSynced on Preview or Preprod.
- DUST wallet synchronization is slow because it replays history; no supported skip for a wallet that only needs recent dust.

A related recovery question: how stale can a checkpoint be before `restore()` stops working.

## Official pins that matter

Stay on the matrix for Preprod:

- Wallet SDK 1.2.0
- Midnight.js 4.1.1
- Compact toolchain ~0.31.1 / language ~0.23 / runtime 0.16.0
- Proof server 8.1.0 (lab) or 8.1.3 (matrix)
- Indexer: official matrix lists 4.3.302; Blockfrost is the public Preprod path after STL shutdown

Dust sync replays the generation history. A silent open subscription (see servicedesk#251) keeps `isConnected` true while the applied index freezes. Local undeployed does not have the same history length or public indexer drop behavior.

## Lab classifier (LOCAL-TRUE)

`packages/preprod-hello-stub/src/preprod-wallet-sync-stall.mjs` exports a pure function that classifies a progress snapshot or error string into one of:

- `silent-dust-subscription` — isConnected true, appliedIndex stalled while behind highestRelevant
- `dust-tree-nonlinear` — error text about non-linear insert / expected index
- `sync-never-starts` — isSynced false and no subscription activity described
- `unknown`

It does not open sockets, call Blockfrost, or invent timeouts. Use it to map a pasted log to the open issues rather than treating every hang as a new Compact error.

Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This does not claim the public indexer or node is fixed.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
