# Proof-server image silently drops command-line flags

Upstream: [midnightntwrk/servicedesk#242](https://github.com/midnightntwrk/servicedesk/issues/242)
Docs: [midnightntwrk/midnight-docs#1527](https://github.com/midnightntwrk/midnight-docs/issues/1527)

The `midnightntwrk/proof-server` image entrypoint is `bash -c` with the fixed string `midnight-proof-server --port $PORT`. Anything written after the image name is handed to bash and dropped. This affects `-v`, `--network`, `--port`, and `--no-fetch-params` in many official docs and compose files.

On proof-server 8.x the reason for a 400 `bad input` is logged only at DEBUG, so the dropped `-v` hides the server message. `--network preprod` no longer exists; when it does reach the binary the process exits with `unexpected argument '--network'`.

This lab does not change the public image, docs, or examples. It classifies the broken forms and recommends the working environment-variable form. Lab pin stays `midnightntwrk/proof-server:8.1.0`.

Recommended:

```bash
docker run -p 127.0.0.1:6300:6300 -e MIDNIGHT_PROOF_SERVER_VERBOSE=true midnightntwrk/proof-server:8.1.0
```

```yaml
services:
  proof-server:
    image: 'midnightntwrk/proof-server:8.1.0'
    ports:
      - '127.0.0.1:6300:6300'
    environment:
      MIDNIGHT_PROOF_SERVER_VERBOSE: 'true'
```

Port inside the container is set with `PORT` (not `MIDNIGHT_PROOF_SERVER_PORT` or `--port` after the image). `MIDNIGHT_PROOF_SERVER_NO_FETCH_PARAMS=true` only defers downloads; a volume at `/.cache/midnight` keeps the keys.

Decoder: `packages/preprod-hello-stub/src/proof-server-image-flags.mjs`

Official: https://docs.midnight.network/guides/local-proving

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This does not claim a fix of the public indexer, node, or proof-server image.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
