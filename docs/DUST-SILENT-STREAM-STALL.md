# DUST silent stream stall (lab note)

Upstream: [midnightntwrk/servicedesk#251](https://github.com/midnightntwrk/servicedesk/issues/251)

Wallet SDK 1.2.0 (dust-wallet 4.2.0) never notices an indexer subscription that stays open but stops delivering DUST events. `progress.isConnected` stays `true`, no timeout fires, and sync resumes only if the socket drops. Official wallet guide does not publish an inactivity timeout or a resubscribe policy for a quiet stream. https://docs.midnight.network/sdks/official/wallet-developer-guide

This lab does not patch wallet-sdk, does not invent a timeout, and does not fix the public indexer or node. The note only names the recorded gap so a Preprod builder can distinguish a silent subscription from a normal slow sync.

## What the published pages say

- Wallet developer guide: `waitForSyncedState()` waits for the initial sync. `state().isSynced` is the published gate. Sample config points the proving server at `http://localhost:6300`.
- Acquire tokens: connectivity can be true while `isSynced` is still false. Registration waits on `waitForSyncedState()`.
- Neither page publishes an inactivity bound for a quiet DUST subscription, a keep-alive failure mode, or a forced resubscribe from `appliedIndex`.

## Recorded behavior on #251

The subscription (`DustLedgerEvents.runWithBackpressure`) and the client (`shouldRetry: () => false`, `keepAlive: 15_000`) have no inactivity timeout. graphql-ws does not close on missing pongs. A silent open stream never fails the retry path. The wallet stays at the last applied index with `isConnected` true until the socket drops, then resubscribes.

Lab pins remain Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. This note does not change them.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
