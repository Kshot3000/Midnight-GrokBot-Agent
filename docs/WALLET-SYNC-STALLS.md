# Wallet synchronization stalls on Preprod

Upstream: [midnightntwrk/midnight-docs#1381](https://github.com/midnightntwrk/midnight-docs/issues/1381)

Official references:

- https://docs.midnight.network/sdks/official/wallet-developer-guide
- https://docs.midnight.network/guides/networks-and-environments
- https://docs.midnight.network/guides/acquire-tokens
- https://docs.midnight.network/guides/node-server-wallet
- https://docs.midnight.network/guides/generating-dust-programmatically

Issue #1381 tracks repeated high-pain reports of wallet synchronization stalling on Preprod (local devnet works). Symptoms include `waitForSyncedState` never completing, `FacadeState.isSynced` remaining false, dust-channel failures, and non-linear commitment-tree insert errors.

## Official observations relevant to the pinned stack

From the networks-and-environments page:

- "Wallet sync never finishes, and the log shows values inserted non-linearly into dust generation tree (or zswap commitment tree, dust commitment tree)": Saved sync state from the old indexer is not portable. Event and transaction ids differ between indexers. This affects wallets that saved sync state against the Midnight-hosted indexer and resume it on Blockfrost. Discard that state and sync from genesis. Do not shift cursors by hand. A full sync on preprod takes over an hour.
- "Wallet sync timeout right after a transaction, although the funds arrived": On an idle subscription the indexer sends unshielded sync progress less often (backing off to about 4 minutes, up to about 5 with jitter). The "fully synced" signal can lag. Wait for the expected balance or spendable DUST, or allow more than 5 minutes.

From the wallet developer guide and funding pages:

- Use `wallet.waitForSyncedState()` or subscribe to `wallet.state()` and filter on `state.isSynced`.
- Connected is distinct from synced: a wallet can be connected in seconds and finish syncing much later.
- DUST registration and generation require a fully synced wallet. After registering NIGHT for DUST, generation begins once the registration transaction lands; accrual is continuous.
- First sync from genesis is long on Preprod. Persist state with the official `serializeState` / `restore` path so subsequent starts resume.

## Practical checks (no invented APIs)

1. Confirm Blockfrost project token and correct Preprod endpoints (indexer + RPC) from the official configuration examples.
2. Ensure a local proof server is running if the flow needs proving.
3. If non-linear insert errors appear after switching indexers, discard saved state and resync from genesis.
4. Allow substantial time for the first Preprod sync (official note: over an hour possible).
5. Distinguish connection (`progress.isConnected`) from full sync (`isSynced`).

This lab does not claim a fix of the public indexer, node, wallet SDK, or docs. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
