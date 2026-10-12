# Proof server GET /ready returns 503 when all workers are busy

Official reference: [Proof server errors](https://docs.midnight.network/api-reference/error-reference/proof-server-errors).

The health endpoint table says:

| Endpoint | HTTP status | Description |
| --- | --- | --- |
| GET /ready | 200 OK | Server is ready to accept proof requests. |
| GET /ready | 503 Service Unavailable | Server is busy (all workers occupied). |

Common issues: "503 from /ready — All proof workers are busy. Wait for current proofs to complete or increase the worker count in config."

This is distinct from a 429 JobQueueFull on /check or /prove. A 503 on /ready means the server process is up and the port is bound, but no worker is free. On first start (before keys are fetched) the process may not listen at all (see servicedesk#242).

The lab decoder `packages/preprod-hello-stub/src/proof-ready-503.mjs` classifies a 503 /ready response or a client error that mentions it. It does not call a proof server, does not invent APIs, and does not claim to fix the public proof server, indexer, or node.

```bash
cd packages/preprod-hello-stub
node src/proof-ready-503.mjs
npm run check:proof-ready-503
```

Related upstream: [midnightntwrk/servicedesk#242](https://github.com/midnightntwrk/servicedesk/issues/242) (image flags and key-download exit before the port binds).

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
