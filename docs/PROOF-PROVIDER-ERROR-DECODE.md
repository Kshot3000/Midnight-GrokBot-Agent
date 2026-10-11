# Proof provider drops the proof server's error message

Upstream: [midnightntwrk/servicedesk#243](https://github.com/midnightntwrk/servicedesk/issues/243)

`@midnight-ntwrk/midnight-js-http-client-proof-provider` 4.1.1 (matrix version) and 5.0.0-rc.4 throw `Failed Proof Server response: url="…", code="400", status="Bad Request"` when the proof server rejects a request. The response body is never read. On proof-server 8.x the body is the only place that says `bad input`, `Job Queue full`, or `internal error`. From 9.0.0-rc.9 the body carries the reason (for example `bad input: \`couldn't find built-in key increment\`` when ZKIR is missing). A timeout becomes `AbortError: The user aborted a request.` with no duration.

This lab does not patch midnight-js, does not call the live proof server, and does not claim a fix of the public indexer or node. `packages/preprod-hello-stub/src/proof-provider-error-decode.mjs` maps the two incomplete shapes already reported upstream onto the official proof-server error page so a builder can name the dropped body or the timeout.

Official:

- https://docs.midnight.network/api-reference/error-reference/proof-server-errors
- https://docs.midnight.network/api-reference/midnight-js/@midnight-ntwrk/midnight-js-http-client-proof-provider/functions/httpClientProofProvider
- https://docs.midnight.network/guides/local-proving

Pins used by this lab: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Also read this run: servicedesk#242 (proof-server image drops flags), midnight-docs#1527 (docs docker run forms that drop -v), midnight-docs#1509 (1010 decode), example-hello-world#41 (unused deps). None of those are fixed here.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
