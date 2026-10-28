# Preprod wallet synchronization stall symptoms

Upstream: [midnightntwrk/midnight-docs#1381](https://github.com/midnightntwrk/midnight-docs/issues/1381)

Official docs ([Funding a wallet](https://docs.midnight.network/guides/acquire-tokens), [Wallet SDK API Reference](https://docs.midnight.network/api-reference/wallet-sdk), [How to generate DUST programmatically on Preprod](https://docs.midnight.network/guides/generating-dust-programmatically)) describe `isSynced` as the gate after the shielded, unshielded, and dust channels have completed their progress. A wallet can be connected while still syncing. On Preprod the dust channel replays generation history; local devnet finishes much faster.

The open documentation issue reports repeated builder symptoms on Preprod (local works):

- `waitForSyncedState()` or `FacadeState.isSynced` never becomes true
- dustWallet sync process errors, including non-linear insertion into the dust commitment tree (expected index vs received)
- shielded sync leg never connects or issues subscriptions
- slow dust replay of full history

This lab does not patch the public indexer, node, proof-server, or wallet-sdk. It only records the symptoms from the issue and points builders to the official guides that distinguish connected vs synced and that require a fully synced state before registering NIGHT for DUST.

A local string classifier that matches those symptom phrases (no network calls, no invented APIs) lives in `packages/preprod-hello-stub/src/wallet-sync-stall-decode.mjs`. A Compact pointer is in `contracts/hello-midnight/wallet-sync-stall-note.compact`.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This does not claim a fix of the public indexer, node, or wallet sync.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
