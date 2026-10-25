# Preprod faucet page confirmation now matches official docs

Upstream: [midnightntwrk/servicedesk#254](https://github.com/midnightntwrk/servicedesk/issues/254)

Official docs ([Funding a wallet](https://docs.midnight.network/guides/acquire-tokens)) now state that a Preprod faucet request sends **5,000 tNIGHT** and the hosted page confirms:

> You will shortly receive 5000 tNight in your wallet.

The open issue (opened 2026-10-16) reported that `POST /drips` multiplies the requested `amount` by 5 tNIGHT (`TNIGHT_UNIT = 5_000_000n` STAR), so a body with `"amount": "1000"` credits 5,000 tNIGHT, and the page confirmed 5000 while the docs at that time described 1,000. The docs page has since been updated to match the actual credit and confirmation of 5,000 tNIGHT.

This lab does not patch the faucet, does not run a faucet, and does not claim the public service is fixed. It only records that the published confirmation and the received amount now agree with the official guide:

- official docs and page confirmation: 5,000 tNIGHT
- request body historically used `"amount": "1000"` which the route scales by the 5 tNIGHT unit

A local classifier lives in `packages/preprod-hello-stub/src/faucet-page-confirmation.mjs`. It does not contact the faucet and does not invent an API. A Compact pointer is in `contracts/hello-midnight/faucet-unit-note.compact`.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This does not claim a fix of the public faucet, indexer, or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
