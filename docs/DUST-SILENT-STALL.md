# Silent DUST subscription stall on Preprod

Upstream: [midnightntwrk/servicedesk#251](https://github.com/midnightntwrk/servicedesk/issues/251)

Official reference: [Wallet developer guide](https://docs.midnight.network/sdks/official/wallet-developer-guide).

Wallet SDK 1.2.0 keeps `progress.isConnected === true` and never resubscribes when the DUST indexer subscription stays open but stops delivering events. The applied index freezes until something else drops the socket.

The lab classifier in `packages/preprod-hello-stub/src/dust-silent-stall-decode.mjs` recognizes the pattern (isConnected true + stalled appliedIndex, or quiet-stream wording) and points builders at a wallet restart. It does not call the wallet SDK, does not invent a timeout, and does not claim to fix the public indexer or node.

```bash
cd packages/preprod-hello-stub
node src/dust-silent-stall-decode.mjs
npm run check:dust-silent-stall
```

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0, wallet-sdk 1.2.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
