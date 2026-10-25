# Proof provider error decode

Upstream: [midnightntwrk/servicedesk#243](https://github.com/midnightntwrk/servicedesk/issues/243)

Official proof-server guide:

https://docs.midnight.network/guides/run-proof-server

Local proving:

https://docs.midnight.network/guides/local-proving

midnight-js 4.1.1's HTTP proof provider (`@midnight-ntwrk/midnight-js-http-client-proof-provider`) is reported to throw only the status line

```
Failed Proof Server response: url="…", code="400", status="Bad Request"
```

and never read the response body. On proof-server 8.x the body is one of `bad input`, `Job Queue full`, or `internal error`. A client timeout surfaces as `The user aborted a request.`

This lab does not edit midnight-js, does not invent a response schema, and does not claim a fix of the proof server, indexer, or node.

## Lab helper

`packages/preprod-hello-stub/src/proof-provider-error-decode.mjs` exports `classifyProofProviderError`. It matches the two strings midnight-js already emits and notes when a known body phrase is present. It performs no network calls. LOCAL-TRUE.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
