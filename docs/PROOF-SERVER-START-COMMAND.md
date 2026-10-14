# Correct proof-server start command (flags are dropped)

Upstream docs: [midnightntwrk/midnight-docs#1527](https://github.com/midnightntwrk/midnight-docs/issues/1527)

Upstream image: [midnightntwrk/servicedesk#242](https://github.com/midnightntwrk/servicedesk/issues/242)

Official pages that still show the broken forms (checked 2026-10-14):
- [Proving transactions locally](https://docs.midnight.network/guides/local-proving) (`docker run … midnight-proof-server -v` and Compose `command: ['midnight-proof-server', '-v']`)
- [Install the toolchain](https://docs.midnight.network/getting-started/installation) (same docker run)

The [compatibility matrix](https://docs.midnight.network/relnotes/support-matrix) lists proof server **8.1.3** for Preview, Preprod and Mainnet. The getting-started and local-proving pages still pin the image tag at 8.1.0 and pass flags that the image entrypoint drops.

The `midnightntwrk/proof-server` image entrypoint is `bash -c` with a fixed command string. Arguments after the image name (or a Compose command array) do not reach `midnight-proof-server`. `-v`, `--network`, `--port`, and `--no-fetch-params` are silently dropped. On 8.x the reason for a 400 `bad input` is only logged at DEBUG, so the missing `-v` hides the cause that midnight-js already drops (see [servicedesk#243](https://github.com/midnightntwrk/servicedesk/issues/243)).

## Use the environment variable

Pin a tested tag and set verbose with the env var. Give no command. Lab continues to pin proof-server 8.1.0 as instructed; the matrix tag is shown for reference only:

```bash
docker run -p 127.0.0.1:6300:6300 -e MIDNIGHT_PROOF_SERVER_VERBOSE=true midnightntwrk/proof-server:8.1.0
```

Matrix-aligned example (not the lab pin):

```bash
docker run -p 127.0.0.1:6300:6300 -e MIDNIGHT_PROOF_SERVER_VERBOSE=true midnightntwrk/proof-server:8.1.3
```

Compose:

```yaml
services:
  proof-server:
    image: midnightntwrk/proof-server:8.1.0
    ports:
      - '127.0.0.1:6300:6300'
    environment:
      MIDNIGHT_PROOF_SERVER_VERBOSE: 'true'
```

- Port inside the container is controlled by `PORT`, not by a dropped `--port` or by `MIDNIGHT_PROOF_SERVER_PORT`.
- `MIDNIGHT_PROOF_SERVER_NO_FETCH_PARAMS=true` defers key downloads; it does not skip them. Pair it with a volume at `/.cache/midnight` if you want offline restarts.
- `--network preprod` is invalid on current images; drop it.

This lab note does not run Docker, does not contact a proof server, and does not claim the public image or the official docs are fixed. The classifier in `packages/preprod-hello-stub/src/proof-server-official-command.mjs` flags the two official dropped-flag snippets.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This does not claim a fix of the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
