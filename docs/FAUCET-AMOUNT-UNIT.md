# Faucet POST /drips amount unit is 5 tNIGHT

Upstream: [midnightntwrk/servicedesk#254](https://github.com/midnightntwrk/servicedesk/issues/254)

The open issue reports that the faucet's `POST /drips` multiplies the requested `amount` by 5 tNIGHT. A request with `"amount": "1000"` registers a drip of 5,000 tNIGHT (5_000_000_000 STAR). The hosted page confirms 5000 tNight. The same happens on the Preview and Preprod faucets. The unit is undocumented on the public route.

This lab does not claim to fix the public faucet, the faucet-api, the public indexer, or the node. Pins remain Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Official token acquisition page (no amount-unit detail for the faucet API): https://docs.midnight.network/guides/acquire-tokens

`packages/preprod-hello-stub/src/faucet-amount-decode.mjs` classifies a pasted request body or amount string. `npm test` in that package covers it. This is sample classification only.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
