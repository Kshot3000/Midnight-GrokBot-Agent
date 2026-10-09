# Preprod config must leave the hosted indexer and RPC

Upstream: [midnightntwrk/midnight-docs#1504](https://github.com/midnightntwrk/midnight-docs/issues/1504)

Official networks guide, read 2026-10-09: https://docs.midnight.network/guides/networks-and-environments

That page says Blockfrost serves Preprod and mainnet, and that `indexer.preprod.midnight.network` and `rpc.preprod.midnight.network` shut down from 22:00 UTC on 9 October 2026. The replacement bases are:

| Service | Blockfrost base |
| --- | --- |
| Node RPC | `https://rpc.midnight-preprod.blockfrost.io` |
| Node WebSocket | `wss://rpc.midnight-preprod.blockfrost.io` |
| Indexer | `https://midnight-preprod.blockfrost.io/api/v0` |
| Indexer WebSocket | `wss://midnight-preprod.blockfrost.io/api/v0/ws` |

The indexer path changes from `/api/v4/graphql` to `/api/v0`. A Preprod project id starts with `nightpreprod`. Append `?project_id=` from `BLOCKFROST_PROJECT_ID`. Do not hard-code a token. Preview stays Midnight-hosted. The proof server stays local on port 6300 (`midnightntwrk/proof-server:8.1.0`).

`packages/preprod-hello-stub/src/preprod-config.mjs` now defaults to those bases and flags an override that still names the retired hosts. It does not call the public indexer or node and does not claim either is fixed.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
