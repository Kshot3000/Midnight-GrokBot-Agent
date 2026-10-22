# Proof server timeout surfaces as AbortError (midnight-js 4.1.1)

Upstream: https://github.com/midnightntwrk/servicedesk/issues/243
Related: https://github.com/midnightntwrk/midnight-js/issues/1459

Official docs only:
- https://docs.midnight.network/api-reference/error-reference/proof-server-errors
- https://docs.midnight.network/guides/local-proving
- https://docs.midnight.network/getting-started/installation

On midnight-js 4.1.1, `httpClientProvingProvider` uses `AbortSignal.timeout`. When the default 300000 ms expires, the error is `AbortError: The user aborted a request.` Nothing in the message names the timeout or the duration. The proof-server body is also dropped on non-2xx responses.

This lab note does not invent APIs, does not patch midnight-js, and does not claim a fix to the public proof server, indexer, or node. It records the published shapes so a builder can classify them locally.

## Official pins

- Compact ~0.31.1 / language ~0.23
- midnight-js 4.1.1
- DApp Connector 4.0.1
- proof-server 8.1.0

## Lab classifier

`packages/preprod-hello-stub/src/proof-server-timeout-workaround.mjs` matches the AbortError shape and the dropped-body shape. It returns a hint that points to the official verbose-logging page and the default timeout. LOCAL-TRUE. No network calls.

## Workaround (until midnight-js#1459 ships)

1. Raise the timeout on the provider config if the circuit is large.
2. Set `MIDNIGHT_PROOF_SERVER_VERBOSE=true` so the server logs the rejection reason at DEBUG (see local-proving guide).
3. Classify the client error with the lab helper above.

This does not fix the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
