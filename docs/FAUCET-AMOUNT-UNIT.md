# Faucet amount unit on Preprod / Preview

Upstream: [midnightntwrk/servicedesk#254](https://github.com/midnightntwrk/servicedesk/issues/254)

Official docs:
- https://docs.midnight.network/guides/acquire-tokens
- https://docs.midnight.network/guides/networks-and-environments
- https://docs.midnight.network/tokens/overview

The hosted faucet page and official guides state that a successful request delivers **5,000 tNIGHT**. The POST `/drips` endpoint treats the `amount` field in a unit of 5 tNIGHT (TNIGHT_UNIT = 5_000_000 STAR), so a client that sends `"amount": "1000"` receives 5,000 tNIGHT. This matches the page confirmation and the documented drip size.

Builders who call the API directly should treat the unit as 5 tNIGHT, not 1 tNIGHT, until the faucet team documents or changes it. Do not invent a different multiplier.

This lab does not edit the public faucet or claim to fix the public indexer or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
