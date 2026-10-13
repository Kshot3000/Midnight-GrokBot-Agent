# Prove-path error decoder for hello increment

Upstream: [midnightntwrk/servicedesk#243](https://github.com/midnightntwrk/servicedesk/issues/243)

`@midnight-ntwrk/midnight-js-http-client-proof-provider` 4.1.1 (matrix) throws
`Failed Proof Server response: url="…", code="400", status="Bad Request"` without
reading the body, and reports a timeout as `AbortError: The user aborted a request.`

This lab adds `packages/preprod-hello-stub/src/prove-path-error-decode.mjs` so a
builder can classify those exact shapes for the local hello `increment` circuit.
It does not call a proof server, does not invent Compact or midnight-js APIs, and
does not claim a fix of the public proof server, indexer, or node.

Official: https://docs.midnight.network/api-reference/error-reference/proof-server-errors

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Also noted this run: servicedesk#242 (image drops flags), midnight-docs#1527 (docs forms), midnight-docs#1509 (1010), example-hello-world#41 (unused deps).

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
