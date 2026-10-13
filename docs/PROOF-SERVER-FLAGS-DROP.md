# Proof-server image drops flags after the image name

Upstream:
- [midnightntwrk/servicedesk#242](https://github.com/midnightntwrk/servicedesk/issues/242) (proof-server image entrypoint drops CLI flags; key download fails after 3 attempts)
- [midnightntwrk/midnight-docs#1527](https://github.com/midnightntwrk/midnight-docs/issues/1527) (docs and examples still show the broken forms)

The `midnightntwrk/proof-server` image (observed on 8.1.3 and 8.0.3) has an entrypoint of `bash -c` whose command is the single string `midnight-proof-server --port $PORT`. Anything after the image name is handed to `bash -c` as `$0` or later arguments, so it never reaches the binary.

Common forms that start the server but silently drop flags:

```bash
docker run ... midnightntwrk/proof-server:8.1.3 midnight-proof-server -v
docker run ... midnightntwrk/proof-server:8.1.3 -- midnight-proof-server -v
```

Compose:

```yaml
command: ['midnight-proof-server', '-v']
```

`-v` (verbose / DEBUG) is dropped. On proof-server 8.x the reason for a 400 `bad input` is logged only at DEBUG, so the failure reason never appears. `--network` (legacy) and `--port` are also dropped. The image's own `--port $PORT` overrides `MIDNIGHT_PROOF_SERVER_PORT`; set `PORT` to change the listen port inside the container.

Workarounds that reach the binary (confirmed in the upstream reports):

- Environment variable: `-e MIDNIGHT_PROOF_SERVER_VERBOSE=true`
- Single string command: `'midnight-proof-server -v'` or `'midnight-proof-server --port 6300 -v'`
- For key downloads: mount a volume at `/.cache/midnight` so completed parameter files survive restarts. A brief 503 or slow link can exhaust the three no-backoff attempts and exit the process before the port is bound.

Official docs still show the array / trailing-flag form (for example local-proving). This lab does not change the public image, node, or indexer. Pins used here: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Also read this run: servicedesk#243 (midnight-js proof provider drops the proof-server response body), servicedesk#236 (deploy runtime mismatch messages), midnight-docs#1527 (same flag issue in docs), example-hello-world#41 (unused deps). None of those are fixed here.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
