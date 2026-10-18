# Preprod faucet page confirmation vs official docs

Upstream: [midnightntwrk/servicedesk#254](https://github.com/midnightntwrk/servicedesk/issues/254)

Official docs ([Funding a wallet](https://docs.midnight.network/guides/acquire-tokens)) state that a Preprod faucet request sends 1,000 tNIGHT and the hosted page confirms:

> You will shortly receive 1000 tNight

The open issue reports that the same page actually confirms 5000 tNight because the public `POST /drips` route multiplies the requested `amount` by 5 tNIGHT (`TNIGHT_UNIT = 5_000_000n` STAR). A request body with `"amount": "1000"` registers a drip of 5,000 tNIGHT (5_000_000_000 STAR). The page confirmation and the on-chain credit agree with the multiplied value; the official docs currently describe the un-multiplied figure.

This lab does not patch the faucet, does not run a faucet, and does not claim the public service is fixed. It only classifies the confirmation so a builder knows the page and the request number currently disagree with the published docs:

- docs and request string say 1,000 tNIGHT
- page confirmation and received amount are 5,000 tNIGHT
- unit on the public route is an undocumented 5 tNIGHT step

A local classifier lives in `packages/preprod-hello-stub/src/faucet-page-confirmation.mjs`. It does not contact the faucet and does not invent an API. A Compact pointer is in `contracts/hello-midnight/faucet-unit-note.compact`.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This does not claim a fix of the public faucet, indexer, or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
