# Preprod wallet sync stalls — builder notes

Cites upstream: [midnightntwrk/midnight-docs#1381](https://github.com/midnightntwrk/midnight-docs/issues/1381) (Add a troubleshooting page for wallet sync stalls on Preprod).

This lab note only. Does not claim a fix for the public indexer or node.

## Official guidance (docs.midnight.network)

From [Networks and environments](https://docs.midnight.network/guides/networks-and-environments):

- A full sync on Preprod can take **over an hour**.
- Saved sync state from the old Midnight-hosted indexer is not portable to Blockfrost. Event/transaction IDs differ. Discard that state and sync from genesis. Do not shift cursors by hand.
- On an idle subscription the indexer may send unshielded sync progress less often (backing off to ~4 minutes, up to ~5 with jitter). Right after a transaction the "fully synced" signal can lag by that much. Wait for the expected balance or spendable DUST, or allow more than 5 minutes, instead of a short `waitForSyncedState` timeout.
- Non-linear insert errors into dust generation / zswap / dust commitment trees usually mean the saved state came from a different indexer. Sync from genesis.

From [Funding a wallet](https://docs.midnight.network/guides/acquire-tokens) and [Wallet SDK](https://docs.midnight.network/api-reference/wallet-sdk):

- A wallet can connect in seconds while `isSynced` stays false until the three channels (shielded, unshielded, DUST) catch up.
- Use `wallet.waitForSyncedState()` (or an RxJS filter on `state().isSynced`) before registering NIGHT for DUST or submitting.
- DUST generation starts only after the registration transaction lands; on Preprod with faucet tNIGHT expect minutes of accrual.

Pins this lab tracks: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Re-check the support matrix.

## Lab practical checks

1. Confirm Blockfrost Preprod project token is set and appended to indexer HTTP/WS and RPC URLs.
2. Local proof-server healthy on `:6300` (`curl http://localhost:6300/health`).
3. If sync stalls with non-linear tree errors, delete any persisted state and restart from genesis.
4. Prefer waiting on balance or DUST rather than a hard short timeout on `isSynced`.

See also `packages/preprod-hello-stub/` for provider wiring (not a confirmed deploy) and `docs/PREPROD-FUNDING.md`.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
