# Map midnight-js proof-provider status codes to official proof-server errors

Upstream: [midnightntwrk/servicedesk#243](https://github.com/midnightntwrk/servicedesk/issues/243)

Official: [Proof server errors](https://docs.midnight.network/api-reference/error-reference/proof-server-errors)

`@midnight-ntwrk/midnight-js-http-client-proof-provider` 4.1.1 throws an error that includes the HTTP status code but drops the response body. The body is the only place the proof server names the concrete `WorkerPoolError` or `WorkError` (for example `Job Queue full` or `bad input: \`couldn't find built-in key increment\``).

This lab helper extracts `code="400"` (or similar) from the error text that *is* present and maps it to the official error family documented for that status. It does not call a proof server, does not patch midnight-js, and does not claim to fix the public proof server, indexer, or node.

```bash
cd packages/preprod-hello-stub
node src/proof-status-map.mjs
npm run check:proof-status-map
```

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
