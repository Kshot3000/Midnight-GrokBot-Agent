# Proof Server Docker Commands Drop Flags

Upstream issues:

- [midnightntwrk/servicedesk#242](https://github.com/midnightntwrk/servicedesk/issues/242) — proof-server image silently drops command-line flags (entrypoint is `bash -c` with a single string `midnight-proof-server --port $PORT`).
- [midnightntwrk/midnight-docs#1527](https://github.com/midnightntwrk/midnight-docs/issues/1527) — docs pages show `docker run ... midnight-proof-server -v` and Compose `command: ['midnight-proof-server', '-v']` that never reach the binary.

Official docs still show the broken form (checked 2026-10-14):

- https://docs.midnight.network/guides/local-proving
- https://docs.midnight.network/getting-started/installation

## What happens

The image entrypoint is `bash -c`. Anything after the image name is passed as arguments to `bash -c`, which executes only the first word. So:

```bash
docker run -p 6300:6300 midnightntwrk/proof-server:8.1.0 midnight-proof-server -v
```

starts the server but drops `-v`. Verbose logging stays off. On 8.x the reason for a 400 `bad input` is logged only at DEBUG level.

The same drop happens for `--port`, `--network` (which no longer exists), and `--no-fetch-params`.

## Correct forms (pin 8.1.0 as required)

Use environment variables. Do not pass a command.

```bash
docker run -p 127.0.0.1:6300:6300 \
  -e MIDNIGHT_PROOF_SERVER_VERBOSE=true \
  midnightntwrk/proof-server:8.1.0
```

Docker Compose:

```yaml
services:
  proof-server:
    image: 'midnightntwrk/proof-server:8.1.0'
    ports:
      - '127.0.0.1:6300:6300'
    environment:
      MIDNIGHT_PROOF_SERVER_VERBOSE: 'true'
    healthcheck:
      test: ['CMD-SHELL', 'echo > /dev/tcp/127.0.0.1/6300']
      interval: 10s
      timeout: 5s
      retries: 20
      start_period: 10s
```

## Port and offline notes

- The container listens on the value of `PORT` (default 6300). `MIDNIGHT_PROOF_SERVER_PORT` is overridden by the image's own `--port $PORT`.
- To skip the startup parameter download use `MIDNIGHT_PROOF_SERVER_NO_FETCH_PARAMS=true`. It defers downloads to first use; it does not make the server fully offline. Mount a volume at `/.cache/midnight` to keep keys across restarts.
- `--network` is no longer a valid flag.

## Verification

```bash
curl http://127.0.0.1:6300/health
curl http://127.0.0.1:6300/version   # should report 8.1.0
curl http://127.0.0.1:6300/ready
```

With `MIDNIGHT_PROOF_SERVER_VERBOSE=true` a request should produce DEBUG lines in the container logs.

This lab note does not claim any change to the public proof server, node, or indexer. It only documents the working local start path for builders pinned to proof-server 8.1.0, midnight-js 4.1.1, and Compact ~0.31.1 / language ~0.23.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
