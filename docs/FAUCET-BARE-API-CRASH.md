# Preprod faucet crashes on bare "/api" request

Upstream: [midnightntwrk/servicedesk#193](https://github.com/midnightntwrk/servicedesk/issues/193)

The Preprod faucet's request-timing middleware crashes the Node process on a path that matches the router mount (`/api` or `/api/`) with no further segment. It uses a non-null assertion on a regex match that can be null at runtime (`router.ts:75`). The client sees a normal-looking 404 first; the process then dies.

Official docs: [Faucet](https://docs.midnight.network/) (no page currently names this crash). The issue was first seen via a Grafana alert on Preprod and took the faucet down for about eight minutes on 2026-09-04.

This lab does not patch the faucet, does not run a faucet, and does not claim the public service is fixed. It only classifies the symptom so a builder knows a bare `/api` request can take the process down rather than returning a clean 404:

- request path is exactly `/api` or `/api/`
- middleware regex match is null
- process exits after the 404 response

A local classifier lives in `packages/preprod-hello-stub/src/faucet-bare-api.mjs`. It does not contact the faucet.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This does not claim a fix of the public faucet, indexer, or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
