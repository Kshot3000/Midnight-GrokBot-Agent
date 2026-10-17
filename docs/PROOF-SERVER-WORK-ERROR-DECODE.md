# Proof-server WorkError decoding when midnight-js drops the body

Upstream: [midnightntwrk/servicedesk#243](https://github.com/midnightntwrk/servicedesk/issues/243)

Official reference (do not invent names or statuses):
https://docs.midnight.network/api-reference/error-reference/proof-server-errors

The official page lists WorkError variants returned by the proof server (typically on port 6300):

- 400 BadInput(String) — proof request input data is invalid.
- 500 CancelledUnexpectedly — the system cancelled the job without an explicit request.
- 500 InternalError(String) — internal proof generation error.
- 500 JoinError — task join error during proof generation.

On proof-server 8.x the HTTP body is often the short form (`bad input`, `internal error`). From 9.0.0-rc.9 the body can carry a reason. `@midnight-ntwrk/midnight-js-http-client-proof-provider` 4.1.1 never reads the response body, so the client error only shows the URL, status code, and status text. A timeout is reported as `AbortError: The user aborted a request.`

This lab pins proof-server **8.1.0** and midnight-js **4.1.1**. The decoder in `packages/preprod-hello-stub/src/proof-server-work-error-decode.mjs` classifies a captured body or verbose log line against the official WorkError names. It does not call the proof server, does not claim the public proof server or midnight-js is fixed, and does not invent APIs.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Related lab files:
- `packages/preprod-hello-stub/src/proof-timeout-decode.mjs`
- `packages/preprod-hello-stub/src/proof-provider-full-decode.mjs`
- `packages/preprod-hello-stub/src/proof-server-official-error-map.mjs`

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
