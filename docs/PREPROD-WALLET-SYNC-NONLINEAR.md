# Preprod wallet sync: non-linear dust commitment tree (midnight-docs#1381)

Upstream issue: [midnightntwrk/midnight-docs#1381](https://github.com/midnightntwrk/midnight-docs/issues/1381)

Official references (do not invent APIs):

- https://docs.midnight.network/guides/networks-and-environments
- https://docs.midnight.network/guides/acquire-tokens
- https://docs.midnight.network/sdks/official/wallet-developer-guide

## Reported symptom

Wallet synchronization stalls or never reaches `isSynced === true` on Preprod (local devnet works). Logs include phrases such as:

- values inserted non-linearly into dust generation tree
- values inserted non-linearly into zswap commitment tree
- values inserted non-linearly into dust commitment tree
- dustWallet sync process errors
- FacadeState.isSynced never becomes true

## Official guidance

From Networks and environments:

Wallet sync never finishes, and the log shows values inserted non-linearly into dust generation tree (or zswap commitment tree, dust commitment tree). Saved sync state from the old indexer is not portable: event and transaction ids differ between indexers. This affects only wallets that saved sync state against the Midnight-hosted indexer and resume it on Blockfrost, such as serializeState() output, fast-sync or preseed bundles, and stored event or transaction ids. Discard that state and sync from genesis. Do not shift cursors by hand. Allow for a long first sync: a full sync on preprod takes over an hour. Wallets that sync from genesis on every start, and DApps that only read contract state or submit transactions, are not affected.

Also: connectivity (isConnected) is distinct from synced. A wallet can connect in seconds and finish syncing much later. `waitForSyncedState()` gates operations that need a fully synced wallet. Idle subscriptions may delay progress updates.

## Lab decoder

See `packages/preprod-hello-stub/src/preprod-nonlinear-sync-decode.mjs`. It classifies log text that matches the non-linear insert pattern and points to the official discard-and-resync-from-genesis guidance. It does not call any node, indexer, or wallet. This lab does not claim a fix of the public indexer, node, or wallet SDK.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
