# midnight-js proof provider drops the proof-server response body

Upstream: [midnightntwrk/servicedesk#243](https://github.com/midnightntwrk/servicedesk/issues/243)

Official proof-server errors: [Proof server errors](https://docs.midnight.network/api-reference/error-reference/proof-server-errors)

Pins: midnight-js 4.1.1 (`@midnight-ntwrk/midnight-js-http-client-proof-provider`), proof-server 8.1.0.

`@midnight-ntwrk/midnight-js-http-client-proof-provider` 4.1.1 throws `Failed Proof Server response: url="…", code="400", status="Bad Request"` and never reads the response body. The body is the only place the server says what went wrong (`bad input`, `Job Queue full`, or `internal error` on 8.x). A timeout is reported as `AbortError: The user aborted a request.` instead of naming the timeout.

This lab does not patch midnight-js or the proof server. `packages/preprod-hello-stub/src/proof-provider-body-decode.mjs` classifies the strings the client already surfaces so a builder can map them back to the official error reference. It does not call a proof server.

Check: `node --test test/proof-provider-body-decode.test.mjs` from `packages/preprod-hello-stub`.

Do not claim this fixes the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
