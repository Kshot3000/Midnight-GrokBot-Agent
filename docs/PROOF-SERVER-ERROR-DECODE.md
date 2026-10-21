# Proof-server error decode (midnight-js body drop)

midnight-js 4.1.1's `httpClientProvingProvider` reports only the URL, status code and status text when the proof server returns a non-2xx. It does not read the response body. The body is the only place the server names the error (`BadInput`, `JobQueueFull`, …).

A timeout surfaces as `AbortError: The user aborted a request.`

Upstream: [midnightntwrk/servicedesk#243](https://github.com/midnightntwrk/servicedesk/issues/243)

Official reference: [Proof server errors](https://docs.midnight.network/api-reference/error-reference/proof-server-errors)

Local proving (verbose logging): [Proving transactions locally](https://docs.midnight.network/guides/local-proving)

## Helper

`packages/preprod-hello-stub/src/proof-server-error-decode.mjs` classifies:

- the dropped-body wrapper (`Failed Proof Server response: … code="400" …`)
- abort/timeout text
- named errors from the official table (`BadInput`, `JobQueueFull`, …)

It does not invent APIs, does not call the proof server, and does not claim the public indexer or node is fixed.

Enable `MIDNIGHT_PROOF_SERVER_VERBOSE=true` (or the environment form that the image actually honours) and read container logs for the real reason when the body is dropped.

Built by @kshot9000 https://x.com/kshot9000  
Email: kshot9000@gmail.com  
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v  
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
