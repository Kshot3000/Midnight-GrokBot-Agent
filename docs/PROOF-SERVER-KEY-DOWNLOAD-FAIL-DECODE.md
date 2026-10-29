# Proof-server key download fails after three attempts (servicedesk#242)

Upstream: https://github.com/midnightntwrk/servicedesk/issues/242

Official docs:
- https://docs.midnight.network/guides/local-proving (proof-server image and port)
- https://docs.midnight.network/relnotes/support-matrix (proof-server 8.1.0 / 8.1.3 pins)

## Reported behavior

The `midnightntwrk/proof-server` image entrypoint is effectively `bash -c 'midnight-proof-server --port $PORT'`. Extra arguments after the image name are dropped. Separately, if a parameter key download fails three times in a row (no backoff), the process exits before the port is bound.

A brief 503 or slow link can exhaust the attempts. Completed files under `/.cache/midnight` survive only if a volume is mounted.

## Lab classification (no network, no invented APIs)

`packages/preprod-hello-stub/src/proof-server-key-fetch-fail.mjs` classifies the symptom: process exits with key-fetch failure before listening, or verbose flag is dropped so the reason is not logged.

Workarounds (from upstream reports, not claimed as a public fix):
- Mount a volume at `/.cache/midnight`
- Set `MIDNIGHT_PROOF_SERVER_VERBOSE=true` via environment (flags after the image are dropped)
- Use a single-string command that reaches the binary

This lab does not change the public proof-server image, node, or indexer.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
