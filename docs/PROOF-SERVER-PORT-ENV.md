# Proof server port is set with PORT, not MIDNIGHT_PROOF_SERVER_PORT or --port

Upstream: [midnightntwrk/midnight-docs#1527](https://github.com/midnightntwrk/midnight-docs/issues/1527)

Related image behaviour: [midnightntwrk/servicedesk#242](https://github.com/midnightntwrk/servicedesk/issues/242)

Official: [Proving transactions locally](https://docs.midnight.network/guides/local-proving)

The `midnightntwrk/proof-server` image entrypoint is `bash -c` with the single string `midnight-proof-server --port $PORT`. Anything after the image name is dropped. The image's own `--port $PORT` also overrides `MIDNIGHT_PROOF_SERVER_PORT`.

Observed on 8.1.x (lab pin remains 8.1.0):

- `docker run IMAGE midnight-proof-server -v` or `--port` starts the server but the flag never reaches the binary.
- `-e MIDNIGHT_PROOF_SERVER_PORT=7000` still listens on 6300.
- `-e PORT=7000` moves the listen port inside the container.

The local-proving page still says the proof server has a `--port` flag and a `MIDNIGHT_PROOF_SERVER_PORT` environment variable, and its remap example uses the dropped-flag form. This lab note does not edit the public docs or the image.

Recommended (host remap only, keep container port 6300 unless you also update every client):

```bash
docker run -p 127.0.0.1:6301:6300 -e MIDNIGHT_PROOF_SERVER_VERBOSE=true midnightntwrk/proof-server:8.1.0
```

If you must change the port inside the container:

```bash
docker run -p 127.0.0.1:7000:7000 -e PORT=7000 -e MIDNIGHT_PROOF_SERVER_VERBOSE=true midnightntwrk/proof-server:8.1.0
```

`packages/preprod-hello-stub/src/proof-server-port-env.mjs` classifies a docker/compose snippet for the correct env. It does not run Docker, does not contact a proof server, and does not claim a fix of the public indexer or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
