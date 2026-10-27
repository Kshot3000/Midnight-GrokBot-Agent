# Proof provider error decoding

Upstream: [midnightntwrk/servicedesk#243](https://github.com/midnightntwrk/servicedesk/issues/243)

Official proof-server error reference:

https://docs.midnight.network/api-reference/error-reference/proof-server-errors

Install and pin notes:

https://docs.midnight.network/getting-started/installation

Issue #243 reports that `@midnight-ntwrk/midnight-js-http-client-proof-provider` (pinned 4.1.1) drops the proof-server response body on non-2xx replies. A 400 from proof-server 8.1.0 surfaces only as `Failed Proof Server response: url="…", code="400", status="Bad Request"`. The body (`bad input`, `Job Queue full`, or `internal error` on 8.x; a reason string on later builds) is discarded. Timeouts surface as `AbortError: The user aborted a request.` with no timeout duration.

Lab decoder (does not call a proof server, wallet, indexer, or node):

- `packages/preprod-hello-stub/src/proof-provider-error-decode.mjs`

It matches the error strings quoted in the issue and extracts any body text that happens to be present. This lab does not patch midnight-js, the public indexer, or the node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
