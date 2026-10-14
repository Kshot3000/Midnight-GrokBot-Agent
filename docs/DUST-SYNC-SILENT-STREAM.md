# DUST wallet sync never notices a silent open subscription

Upstream: [midnightntwrk/servicedesk#251](https://github.com/midnightntwrk/servicedesk/issues/251)

Official wallet docs and SDK are at https://docs.midnight.network/sdks/official/wallet-dev-guide (and the Wallet SDK packages). This note only decodes the reported Preprod stall; it does not patch the public wallet SDK, indexer, or node.

## What the issue reports

On Preprod with wallet SDK 1.2.0, if the indexer subscription behind the DUST wallet's sync stays open but stops delivering events, the sync sits still. `progress.isConnected` stays `true`, and nothing errors, times out, or resubscribes. It resumes only when something else drops the connection.

Blockfrost drops idle sockets every minute or two, so the stall often clears by luck. On a connection nothing drops, the wallet would wait indefinitely.

Nothing in the sync path detects silence:

- The update stream and `DustLedgerEvents.runWithBackpressure` have no inactivity timeout.
- Retry runs only when the stream fails; a silent stream never fails.
- graphql-ws keep-alive does not close on missing pongs in the versions used.

## Expected

When the wallet is behind (`appliedIndex` below `highestRelevantWalletIndex`) and the subscription delivers nothing for a set time, close it, resubscribe from `appliedIndex`, and clear `isConnected` until events flow again.

## Lab classification (LOCAL-TRUE)

`packages/preprod-hello-stub/src/dust-sync-silent.mjs` classifies a progress snapshot as a possible silent stall when `isConnected` is true and `appliedIndex` has not advanced while still behind the highest relevant index. It does not open a WebSocket, call Blockfrost, or claim a fix.

Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Re-check the support matrix before any deploy.

This is not a claim that the public indexer or node is fixed.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
