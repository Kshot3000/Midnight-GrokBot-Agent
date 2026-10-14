# Wallet SDK DUST sync never notices a silent subscription

Upstream: [midnightntwrk/servicedesk#251](https://github.com/midnightntwrk/servicedesk/issues/251)

On Preprod the Wallet SDK 1.2.0 DUST sync can sit still while `progress.isConnected` stays `true`. The indexer subscription stays open but stops delivering events. Nothing in the sync path times out on inactivity, so the wallet only resumes when something else drops the socket.

Official source: [Wallet SDK](https://docs.midnight.network/) (no dedicated page names this stall). The issue describes the update stream in `wallet-sdk-dust-wallet` 4.2.0 and the graphql-ws keep-alive that does not close a quiet connection.

This lab does not patch the wallet SDK, the public indexer, or the node. It only classifies the symptom so a builder can tell a silent open subscription from a disconnected one:

- `appliedIndex` does not advance (appliedIndex < highestRelevantWalletIndex)
- `isConnected` remains `true`
- silence of at least 60 seconds with no events
- no resubscribe occurs until the connection is dropped

The classifier in `packages/preprod-hello-stub/src/dust-silent-subscription.mjs` now returns the applied and highest indices on a silent-open hit and includes a multi-sample self-check (caught-up, disconnected, short silence). It does not open a WebSocket or contact Blockfrost.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This does not claim a fix of the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
