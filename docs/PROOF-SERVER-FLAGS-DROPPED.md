# Proof-server image silently drops command-line flags

Upstream: [midnightntwrk/servicedesk#242](https://github.com/midnightntwrk/servicedesk/issues/242)

Docs follow-up: [midnightntwrk/midnight-docs#1527](https://github.com/midnightntwrk/midnight-docs/issues/1527)

The `midnightntwrk/proof-server` image entrypoint is `bash -c` whose command is the single string `midnight-proof-server --port $PORT` (midnight-ledger flake.nix). Arguments written after the image name never reach the binary.

Forms that start a server but drop `-v`, `--network`, `--port`, and `--no-fetch-params`:

- `docker run … midnight-proof-server -v`
- `docker run … -- midnight-proof-server -v`
- Compose `command: ['midnight-proof-server', '-v']`

On 8.x the reason for a 400 `bad input` is logged only at DEBUG, so verbose stays off.

Working form (env var, no command):

```bash
docker run -p 127.0.0.1:6300:6300 -e MIDNIGHT_PROOF_SERVER_VERBOSE=true midnightntwrk/proof-server:8.1.0
```

This lab's prove-path selector now emits that form. It does not run Docker and does not claim a fix of the public proof server, indexer, or node.

Related: the proof provider still drops the response body ([servicedesk#243](https://github.com/midnightntwrk/servicedesk/issues/243)); see `packages/preprod-hello-stub/src/proof-provider-body-decode.mjs`.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
