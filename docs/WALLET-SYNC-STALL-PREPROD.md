# Preprod wallet sync stall troubleshooting (lab)

Upstream: [midnightntwrk/midnight-docs#1381](https://github.com/midnightntwrk/midnight-docs/issues/1381)

Official sources only (do not invent APIs):

- [Networks and environments](https://docs.midnight.network/guides/networks-and-environments) — troubleshooting table for wallet sync
- [Wallet developer guide](https://docs.midnight.network/sdks/official/wallet-developer-guide) — `waitForSyncedState()` and `state().subscribe`
- [Wallet SDK API reference](https://docs.midnight.network/api-reference/wallet-sdk) — same methods
- [Funding a wallet](https://docs.midnight.network/guides/acquire-tokens) — DUST registration after a fully synced wallet

This lab does not edit midnight-docs, does not call a wallet, and does not claim a public indexer or node fix. `packages/preprod-hello-stub/src/wallet-sync-stall-classify.mjs` only maps reported symptom strings to the documented causes below.

## Documented causes and actions

| Symptom (from official troubleshooting) | Documented cause | Documented action |
| --- | --- | --- |
| Wallet sync never finishes; log shows values inserted non-linearly into dust generation tree / zswap commitment tree / dust commitment tree | Saved sync state from the old indexer is not portable; event and transaction ids differ between indexers | Discard that state and sync from genesis. Do not shift cursors by hand. A full sync on Preprod takes over an hour. |
| Wallet sync timeout right after a transaction, although the funds arrived | On an idle subscription the indexer sends unshielded sync progress less often, backing off to about 4 minutes (up to about 5 with jitter) | Wait for the expected balance or spendable DUST, or allow more than 5 minutes, instead of a short synced-state timeout. |
| `isSynced` never becomes true | `isSynced` gates on shielded, unshielded, and DUST all being strictly complete | Wait for all three. A local devnet sync is much faster than Preprod. |

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0, wallet-sdk 1.2.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
