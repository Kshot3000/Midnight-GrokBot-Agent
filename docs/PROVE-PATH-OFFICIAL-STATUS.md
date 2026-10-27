# Prove-path official status decoder for hello

Upstream: [midnightntwrk/servicedesk#243](https://github.com/midnightntwrk/servicedesk/issues/243)

Official proof-server errors page (do not invent): https://docs.midnight.network/api-reference/error-reference/proof-server-errors

`@midnight-ntwrk/midnight-js-http-client-proof-provider` 4.1.1 reports

```text
Failed Proof Server response: url="…", code="400", status="Bad Request"
```

without the body, and reports a timeout as `AbortError: The user aborted a request.`

The official page maps:

- 400 Bad Request → BadInput (check transaction data)
- 429 Too Many Requests → JobQueueFull (wait and retry)
- 428 Precondition Required → JobMissing
- 500 → InternalError / ChannelClosed / JoinError (restart proof server)

This lab extends `packages/preprod-hello-stub/src/prove-path-error-decode.mjs` so a builder classifying a local hello `increment` prove failure can also tag the official status shapes when they appear in the message. It does not call a proof server, does not invent Compact or midnight-js APIs, and does not claim a fix of the public proof server, indexer, or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
