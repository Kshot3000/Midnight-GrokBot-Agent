# Wallet sync stalls on Preprod

Upstream: [midnightntwrk/midnight-docs#1381](https://github.com/midnightntwrk/midnight-docs/issues/1381)

Official: [Networks and environments](https://docs.midnight.network/guides/networks-and-environments), [Funding a wallet](https://docs.midnight.network/guides/acquire-tokens), [Wallet SDK](https://docs.midnight.network/api-reference/wallet-sdk)

Builders report that `waitForSyncedState()` or `state.isSynced` never becomes true on Preprod (local undeployed works). Official troubleshooting already covers the common cases. This lab does not edit midnight-docs and does not claim a public page is fixed.

## What `isSynced` gates on

A facade is synced only when all three legs report strictly complete progress:

- shielded (`state.shielded.state.progress`)
- unshielded (`state.unshielded.progress`)
- DUST (`state.dust.state.progress`)

`isSynced` stays false until every channel has applied every event the indexer has offered. A wallet can be connected (`progress.isConnected === true`) in seconds while still syncing. See the connectivity test in the funding guide: connected is deliberately not the same as synced.

## Expected duration

Local undeployed finishes in seconds. On Preprod a full sync from genesis takes over an hour the first time. Subsequent runs that resume a checkpoint are faster, but idle unshielded subscriptions can back off to about 4–5 minutes between progress updates, so a short timeout after a transaction can look like a stall even when funds have arrived.

## Common failure: non-linear commitment-tree insert

Log line of the form “values inserted non-linearly into dust generation tree” (or zswap / dust commitment tree) means the saved sync state was produced against a different indexer. Event and transaction ids are not portable. Discard the checkpoint (serializeState output, fast-sync bundle, stored ids) and sync from genesis. Do not hand-edit cursors.

## DUST channel specifics

DUST sync replays the generation history. A silent subscription that stays open never triggers the retry path in wallet-sdk 1.2.0; the wallet only recovers when the socket drops. Blockfrost drops idle sockets every minute or two, which masks the gap on Preprod. Official docs do not prescribe a client-side inactivity timeout; they tell you to wait for spendable DUST or to allow more than five minutes instead of a short synced-state timeout.

## Checkpoint staleness

Official guidance: if restore() fails after an indexer change, discard the old checkpoint and resync from genesis. There is no published “maximum age” number; the failure mode is indexer identity, not calendar age.

## What this lab does not claim

This document cites the open docs issue and the official troubleshooting table. It does not fix the public indexer, the node, or the wallet SDK. Pins tracked here: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0, wallet-sdk 1.2.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
