# Wallet sync stalls on Preprod

Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1381

Official docs only:
- Networks and environments: https://docs.midnight.network/guides/networks-and-environments — migration notes and troubleshooting tables for Preprod/Blockfrost
- Wallet developer guide: https://docs.midnight.network/sdks/official/wallet-developer-guide — `waitForSyncedState()`, `isSynced`, dust balance
- Support matrix: https://docs.midnight.network/relnotes/support-matrix — Wallet SDK 1.2.0, Midnight.js 4.1.1, proof-server pins

Issue #1381 tracks repeated builder reports of wallet synchronization stalling on Preprod (local undeployed works). Symptoms include `waitForSyncedState()` never resolving, `isSynced` staying false, dust channel not connecting, and non-linear inserts into the dust or zswap commitment tree.

This lab note does not invent APIs, does not call public endpoints, and does not claim a fix to the public indexer or node. It only collates published guidance for the pinned stack so builders can distinguish a slow first sync from a stalled one.

## Published guidance (from official pages)

From Networks and environments:

| Symptom | Cause and fix |
|---|---|
| Wallet sync never finishes; log shows values inserted non-linearly into dust generation tree (or zswap / dust commitment tree) | Saved sync state from the old Midnight-hosted indexer is not portable (event and transaction ids differ). Affects wallets that saved state against the retired indexer and resume on Blockfrost. Discard that state and sync from genesis. Do not shift cursors by hand. A full first sync on Preprod takes over an hour. |
| Wallet sync timeout right after a transaction, although funds arrived | On an idle subscription the indexer sends unshielded sync progress less often (backs off to ~4 minutes, up to ~5 with jitter). Wait for the expected balance or spendable DUST, or allow more than 5 minutes instead of a short timeout. |
| Wallet sync is slow after startup | The indexer is catching up with the node. Confirm the node produces blocks and watch indexer logs. |

From the wallet guide: call `wallet.start(...)` then `await wallet.waitForSyncedState()`. Subscribe to `wallet.state()` and check `state.isSynced`. DUST balance is available via `state.dust.balance(new Date())` after registration. Connectivity (`progress.isConnected`) is distinct from full sync (`isSynced`).

Proof server must be reachable on port 6300 (local). Official pages note that a missing or unreachable proof server surfaces as proving failures, not as a sync stall, but builders have reported it in the same failure cluster.

## Lab helper

`packages/preprod-hello-stub/src/wallet-sync-stall-decode.mjs` exports a pure classifier for the error strings quoted above. It performs no network calls. LOCAL-TRUE.

Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
