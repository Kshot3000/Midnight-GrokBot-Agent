# Preprod wallet synchronization stalls

Upstream: [midnightntwrk/midnight-docs#1381](https://github.com/midnightntwrk/midnight-docs/issues/1381)

Official:

- https://docs.midnight.network/guides/networks-and-environments
- https://docs.midnight.network/sdks/official/wallet-developer-guide

midnight-docs#1381 tracks repeated Preprod wallet sync stalls reported in Kapa traffic. Official guidance (networks-and-environments and the wallet developer guide) covers the common symptoms. This lab note only restates those published causes so builders on the pinned stack can classify them. It does not call a wallet, indexer, or node, does not invent APIs, and does not claim a fix of the public indexer or node.

## Documented symptoms and actions

- **Non-linear / non-portable indexer state**  
  Symptom: values inserted non-linearly into the dust commitment tree, or similar zswap commitment messages.  
  Cause: saved sync state from the old indexer is not portable; event and transaction ids differ between indexers.  
  Action: discard that state and sync from genesis. Do not shift cursors by hand. A full Preprod sync takes over an hour.

- **Idle subscription lag after a transaction**  
  Symptom: timeout right after a transaction even though funds arrived.  
  Cause: on an idle subscription the indexer sends unshielded sync progress less often, backing off to about 4 minutes (up to about 5 with jitter).  
  Action: wait for the expected balance or spendable DUST, or allow more than 5 minutes, instead of a short synced-state timeout.

- **isSynced never becomes true**  
  Symptom: synchronization starts but `isSynced` stays false on Preprod (local devnet finishes).  
  Cause: `isSynced` is true only when shielded, unshielded, and DUST progress are all strictly complete.  
  Action: wait for all three. A local devnet sync is much faster than Preprod. Use `waitForSyncedState()` from the wallet guide.

Lab classifier: `packages/preprod-hello-stub/src/wallet-sync-stall-classify.mjs` (see `npm run check:wallet-sync-stall`). It matches the symptoms above and does not contact the network. LOCAL-TRUE.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
