# Proof-provider timeout surfaces as AbortError (lab)

Upstream: [midnightntwrk/servicedesk#243](https://github.com/midnightntwrk/servicedesk/issues/243)

Official: https://docs.midnight.network/guides/run-proof-server

midnight-js 4.1.1 (`@midnight-ntwrk/midnight-js-http-client-proof-provider`) uses `AbortSignal.timeout`. When that fires, the error that reaches the caller is `AbortError: The user aborted a request.` Nothing in the message says a timeout occurred or what the limit was.

The same provider drops the proof-server response body on non-2xx replies, so a 400 that carries `bad input` or a 9.x reason is reduced to the status line only.

This lab decoder classifies the AbortError string. It does not call a proof server, does not invent an HTTP schema, and does not claim to fix midnight-js, the proof server, the public indexer, or any node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Lab source: `packages/preprod-hello-stub/src/proof-provider-timeout-decode.mjs`

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
