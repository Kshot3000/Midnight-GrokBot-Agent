# Preprod faucet amount unit mismatch

Upstream: [midnightntwrk/servicedesk#254](https://github.com/midnightntwrk/servicedesk/issues/254)

Official docs ([Funding a wallet](https://docs.midnight.network/guides/acquire-tokens)) say a Preprod faucet request sends 1,000 tNIGHT, and the hosted page confirms "You will shortly receive 1000 tNight".

The open issue reports that `POST /drips` multiplies the requested `amount` by 5 tNIGHT (`TNIGHT_UNIT = 5_000_000n` STAR). A body with `"amount": "1000"` registers a drip of 5,000 tNIGHT (5_000_000_000 STAR), matching the page's own confirmation of 5000 but not the request number or the docs.

This lab does not patch the faucet, does not run a faucet, and does not claim the public service is fixed. It only classifies the unit so a builder knows the request amount is currently in an undocumented 5 tNIGHT unit on the public route:

- request `"amount": "1000"` → 5_000 tNIGHT received
- page confirmation and on-chain credit agree with the multiplied value
- official docs currently describe 1,000 tNIGHT per request

A local classifier lives in `packages/preprod-hello-stub/src/faucet-amount-unit.mjs`. It does not contact the faucet and does not invent an API.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This does not claim a fix of the public faucet, indexer, or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation

The attempt script packages/preprod-hello-stub/src/attempt-faucet.mjs now classifies the requested amount before any fetch and includes the expected multiplied value in its JSON report and manual steps. It still requires a captcha token and does not claim funding.


Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
