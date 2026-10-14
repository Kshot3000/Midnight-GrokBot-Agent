# Proof provider error classification (timeout-as-abort and dropped body)

Upstream: [midnightntwrk/servicedesk#243](https://github.com/midnightntwrk/servicedesk/issues/243)

Official reference: [Proof server errors](https://docs.midnight.network/api-reference/error-reference/proof-server-errors).

`@midnight-ntwrk/midnight-js-http-client-proof-provider` 4.1.1 drops the response body on non-2xx and reports a timeout as `AbortError: The user aborted a request.` The lab classifier in `packages/preprod-hello-stub/src/proof-error-classify.mjs` recognises both shapes so builders can distinguish them without inventing APIs.

It does not call a proof server, does not patch midnight-js, and does not claim to fix the public indexer or node.

```bash
cd packages/preprod-hello-stub
node src/proof-error-classify.mjs
npm run check:proof-error-classify
```

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
