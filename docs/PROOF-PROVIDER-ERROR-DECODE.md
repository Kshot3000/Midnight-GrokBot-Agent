# Proof-provider dropped-body and timeout decoder

Upstream: [midnightntwrk/servicedesk#243](https://github.com/midnightntwrk/servicedesk/issues/243)

Official:

- [Proof server errors](https://docs.midnight.network/api-reference/error-reference/proof-server-errors)
- [Proving transactions locally](https://docs.midnight.network/guides/local-proving) (verbose logging)
- Default timeout 300000 ms on the http-client proof provider

On midnight-js 4.1.1, `@midnight-ntwrk/midnight-js-http-client-proof-provider` throws

```
Failed Proof Server response: url="…", code="400", status="Bad Request"
```

and never reads the response body. The body is the only place proof-server 8.x names BadInput, a full job queue, or an internal error. A timeout from `AbortSignal.timeout` surfaces as `AbortError: The user aborted a request.` with no indication that a timer fired.

This lab does not edit midnight-js and does not claim the public indexer or node is fixed. `packages/preprod-hello-stub/src/proof-provider-error-decode.mjs` classifies those two messages so a Preprod prove path can point at the official errors table and the verbose runbook instead of treating them as opaque failures.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Official docs only: https://docs.midnight.network/.

Workaround until the upstream fix ships: start the proof server with `MIDNIGHT_PROOF_SERVER_VERBOSE=true` and raise the client timeout above the documented 300000 ms default when circuits are large.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
