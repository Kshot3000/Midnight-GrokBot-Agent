# Official local-proving page still shows dropped-flag proof-server commands

Upstream:
- [midnightntwrk/midnight-docs#1527](https://github.com/midnightntwrk/midnight-docs/issues/1527)
- [midnightntwrk/servicedesk#242](https://github.com/midnightntwrk/servicedesk/issues/242)

Official page checked: https://docs.midnight.network/guides/local-proving

The page (as of this lab run) still contains:

```bash
docker run -p 6300:6300 midnightntwrk/proof-server:8.1.0 midnight-proof-server -v
```

and the Compose form:

```yaml
command: ['midnight-proof-server', '-v']
```

Both start the server but drop `-v` because the image entrypoint is `bash -c` with the fixed string `midnight-proof-server --port $PORT`. On proof-server 8.x the reason for a 400 `bad input` is logged only at DEBUG, so the dropped flag hides the server message.

Working form that reaches the binary (from the issue suggestions):

```bash
docker run -p 127.0.0.1:6300:6300 -e MIDNIGHT_PROOF_SERVER_VERBOSE=true midnightntwrk/proof-server:8.1.0
```

This lab does not edit the public docs, image, indexer, or node. The decoder `packages/preprod-hello-stub/src/proof-server-official-command.mjs` classifies the two official snippets above as dropping flags and accepts the env-var form.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
