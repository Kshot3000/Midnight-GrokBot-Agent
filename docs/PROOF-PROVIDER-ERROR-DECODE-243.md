# Proof-provider error decoding (servicedesk#243)

Upstream: https://github.com/midnightntwrk/servicedesk/issues/243  
Fix tracked: https://github.com/midnightntwrk/midnight-js/issues/1459

Official docs:
- https://docs.midnight.network/api-reference/error-reference/proof-server-errors
- https://docs.midnight.network/guides/local-proving
- https://docs.midnight.network/api-reference/midnight-js/@midnight-ntwrk/midnight-js-http-client-proof-provider/variables/DEFAULT_TIMEOUT

## Reported behavior (midnight-js 4.1.1)

On a non-2xx response the HTTP client proof provider never reads the response body, so the proof server's reason is lost. The client only surfaces the URL, status code, and status text.

A timeout (AbortSignal.timeout, default 300000 ms) surfaces as `AbortError: The user aborted a request.` Nothing says a timeout fired.

Both problems are confirmed; the fix is tracked in midnight-js#1459 (include length-bounded body; report "timed out after N ms").

## Lab decoder

`packages/preprod-hello-stub/src/proof-provider-error-decode-243.mjs` classifies the two symptoms without calling a proof server:

- `timeout-reported-as-abort` — AbortError + "The user aborted a request."
- `status-only-body-dropped` — "Failed Proof Server response" with a code but no known body fragment
- `body-present` — when a later client or a direct log already contains "bad input", "Job Queue full", etc.
- `connection-refused` — nothing listening on the proof-server port

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This lab note does not change upstream midnight-js and does not claim a fix of the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
