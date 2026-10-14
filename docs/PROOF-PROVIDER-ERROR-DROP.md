# midnight-js proof provider drops proof-server error body and misreports timeouts

Upstream: [midnightntwrk/servicedesk#243](https://github.com/midnightntwrk/servicedesk/issues/243)

Official docs: https://docs.midnight.network/api-reference/error-reference/proof-server-errors  
https://docs.midnight.network/guides/local-proving  
https://docs.midnight.network/getting-started/installation

When `@midnight-ntwrk/midnight-js-http-client-proof-provider` 4.1.1 (and 5.0.0-rc.4) receives a non-2xx from the proof server, the thrown error contains only the URL, status code, and status text:

```
Failed Proof Server response: url="…", code="400", status="Bad Request"
```

It never includes the response body. On proof-server 8.x the body is the short form (`bad input`, `Job Queue full`, `internal error`). From 9.0.0-rc.9 the body carries the reason (e.g. `bad input: \`couldn't find built-in key increment\``). That reason is discarded.

A timeout (AbortSignal) surfaces as `AbortError: The user aborted a request.` (4.1.1) or a wrapped form of the same text (5.0.0-rc.4). Nothing names the timeout or the configured duration.

This lab does not patch midnight-js, the proof-server image, the public indexer, or the node. A local classifier in `packages/preprod-hello-stub/src/proof-provider-error-decode.mjs` matches the known string shapes so a builder can tell a dropped-body rejection from a timeout without inventing an API.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This does not claim a fix of the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
