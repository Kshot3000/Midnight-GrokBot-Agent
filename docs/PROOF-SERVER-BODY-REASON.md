# Classify captured proof-server response bodies

Upstream: [midnightntwrk/servicedesk#243](https://github.com/midnightntwrk/servicedesk/issues/243)

Official reference: [Proof server errors](https://docs.midnight.network/api-reference/error-reference/proof-server-errors).

`@midnight-ntwrk/midnight-js-http-client-proof-provider` 4.1.1 drops the response body on non-2xx and reports timeouts as `AbortError: The user aborted a request.` The body is the only place the server reports the actual failure.

When you capture the body yourself (curl, a local proxy, or a patched client), the common 8.x strings are `bad input`, `Job Queue full`, and `internal error`. From 9.0.0-rc.9 the body is ``bad input: `<reason>` `` (for example `couldn't find built-in key increment`).

Lab helper `packages/preprod-hello-stub/src/proof-server-body-reason.mjs` maps those strings to the official `WorkError` / `WorkerPoolError` names. It does not call a proof server, does not patch midnight-js, and does not claim to fix the public indexer or node.

```bash
cd packages/preprod-hello-stub
node src/proof-server-body-reason.mjs
node --test test/proof-server-body-reason.test.mjs
```

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
