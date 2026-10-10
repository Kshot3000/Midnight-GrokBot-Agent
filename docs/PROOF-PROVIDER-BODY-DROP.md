# midnight-js proof provider drops the proof-server body

Upstream: [midnightntwrk/servicedesk#243](https://github.com/midnightntwrk/servicedesk/issues/243)

`@midnight-ntwrk/midnight-js-http-client-proof-provider` 4.1.1 (the matrix pin) throws

```text
Failed Proof Server response: url="…", code="400", status="Bad Request"
```

and never reads the response body. On proof-server 8.x the body is the only place the server says what went wrong (`bad input`, `Job Queue full`, or `internal error`). A timeout is reported as `AbortError: The user aborted a request.` with no duration.

Official proof-server error table: https://docs.midnight.network/api-reference/error-reference/proof-server-errors  
Official provider reference: https://docs.midnight.network/api-reference/midnight-js/@midnight-ntwrk/midnight-js-http-client-proof-provider  
DEFAULT_CONFIG.timeout is 300000 ms.

This lab classifier only inspects a string or Error the caller already has. It does not call a proof server, does not patch midnight-js, and does not claim the public proof server, indexer, or node is fixed.

Check: `node --test test/proof-provider-body-decode.test.mjs` from `packages/preprod-hello-stub`.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Also read this run: servicedesk#236 (runtime mismatch messages), midnight-docs#1527 (docker flag drop), midnight-docs#1509 (1010 decode), example-hello-world#41 (unused deps). None of those are fixed here.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
