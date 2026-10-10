# midnight-js proof provider drops the proof-server response body

Upstream: [midnightntwrk/servicedesk#243](https://github.com/midnightntwrk/servicedesk/issues/243)

Official reference (checked against docs.midnight.network): [Proof server errors](https://docs.midnight.network/api-reference/error-reference/proof-server-errors).

In `@midnight-ntwrk/midnight-js-http-client-proof-provider` 4.1.1 the HTTP client throws

```text
Failed Proof Server response: url="…", code="400", status="Bad Request"
```

and never reads the response body. On proof-server 8.x the body is only `bad input`, `Job Queue full`, or `internal error`. From 9.0.0-rc.9 the body carries the reason, for example `bad input: \`couldn't find built-in key increment\``. That reason is discarded.

A timeout is reported as

```text
AbortError: The user aborted a request.
```

which looks like a user cancel. Nothing says the configured timeout fired.

This lab decoder (`packages/preprod-hello-stub/src/proof-provider-body-decode.mjs`) classifies those two shapes so a builder can tell a dropped body from a timeout without inventing a new API. It does not call a proof server, does not patch midnight-js, and does not claim to fix the public indexer or node.

Run the self-check:

```bash
cd packages/preprod-hello-stub
node src/proof-provider-body-decode.mjs
# or
npm run check:proof-provider-body
```

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
