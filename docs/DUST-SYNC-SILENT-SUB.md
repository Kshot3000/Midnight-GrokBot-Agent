# Wallet SDK DUST sync never notices a silent open subscription

Upstream: [midnightntwrk/servicedesk#251](https://github.com/midnightntwrk/servicedesk/issues/251)

Wallet SDK 1.2.0 (dust-wallet 4.2.0) has no inactivity timeout on the DUST ledger-events subscription. If the indexer WebSocket stays open but stops delivering events, `progress.isConnected` stays `true`, appliedIndex freezes, and nothing resubscribes. Recovery happens only when something else drops the socket (Blockfrost does this after ~1–2 min on Preprod; a quiet connection never recovers).

Official sources (do not invent a timeout API):

- https://docs.midnight.network/guides/manage-dust
- Wallet SDK / indexer client behaviour described in the issue (graphql-ws keep-alive does not close on missing pongs).

## What builders see on Preprod

- `isConnected === true` and `isSynced === false` while appliedIndex stays at the last received id.
- Keep-alive pings are answered; the stream is silent, not failed.
- After a forced drop the wallet resubscribes from the correct index within seconds.

## Practical checks (lab only)

- Watch `dust.progress.appliedIndex` against `highestRelevantWalletIndex`. If the gap does not shrink for longer than your expected event interval and the socket is still open, treat the subscription as dead.
- Restart the wallet (or the DUST subscription) from the last saved appliedIndex. Do not invent a new public API.
- This lab note does not ship a patch to wallet-sdk, the public indexer, or the node. It only records the known gap for builders pinned to midnight-js 4.1.1 and the wallet SDK versions used with Preprod.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Wallet SDK version in the report is 1.2.0.

This does not claim a fix for the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
