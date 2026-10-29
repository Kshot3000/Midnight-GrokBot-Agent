# Faucet POST /drips amount unit on Preprod (servicedesk#254)

Upstream: https://github.com/midnightntwrk/servicedesk/issues/254

Official docs:
- Funding a wallet: https://docs.midnight.network/guides/acquire-tokens — "You will shortly receive 5000 tNight" and "5,000 tNIGHT per faucet request."
- Networks and environments: https://docs.midnight.network/guides/networks-and-environments — "each request sends 5,000 tNIGHT"
- Environments: https://docs.midnight.network/relnotes/network — Preprod faucet UI listed

servicedesk#254 reports that the public faucet `POST /drips` treats the requested `amount` as units of 5 tNIGHT (internal `TNIGHT_UNIT = 5_000_000n` STAR), so a body with `"amount": "1000"` registers a drip of 5,000,000,000 STAR = 5,000 tNIGHT. The hosted page sends that body and confirms "You will shortly receive 5000 tNight", matching the official funding guides. The same behavior is reported on Preview and Preprod.

Builders scripting the endpoint should expect the documented outcome of 5,000 tNIGHT per full request, not 1,000. The request unit is not documented on the official pages; the confirmation message and the guides are.

This lab note does not invent APIs, does not call the faucet, and does not claim a fix of the public faucet, indexer, or node. LOCAL-TRUE.

## Lab helper

`packages/preprod-hello-stub/src/faucet-amount-unit-decode.mjs` exports a decoder that maps a requested amount string to the reported STAR and tNIGHT outcome under the issue's unit, and cites the official 5,000 tNIGHT confirmation.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
