# Proof-server body capture note (servicedesk#243)

midnight-js 4.1.1 (`@midnight-ntwrk/midnight-js-http-client-proof-provider`) reports a non-2xx proof-server response as:

```
Failed Proof Server response: url="…", code="400", status="Bad Request"
```

It does not include the response body. The body is the only place the proof server (8.x / 9.x) states the actual reason (bad input, job queue full, missing built-in key, etc.).

Upstream: https://github.com/midnightntwrk/servicedesk/issues/243

Official error reference: https://docs.midnight.network/api-reference/error-reference/proof-server-errors

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

## Lab recommendation

- Run the local proof server with `MIDNIGHT_PROOF_SERVER_VERBOSE=true` so the container logs the DEBUG reason.
- Or place a short local proxy in front of `:6300` that logs the response body before forwarding to midnight-js.
- Use the classifier in `packages/preprod-hello-stub/src/proof-body-capture-note.mjs` (and the existing `proof-error-classify.mjs`) to detect the dropped-body shape.

This lab note does not modify midnight-js, the proof server, the indexer, or any public node. It is a builder aid only.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
