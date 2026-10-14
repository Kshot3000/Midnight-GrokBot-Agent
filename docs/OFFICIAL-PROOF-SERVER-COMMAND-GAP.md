# Official docs still show proof-server docker forms that drop flags

Upstream:
- [midnightntwrk/servicedesk#242](https://github.com/midnightntwrk/servicedesk/issues/242)
- [midnightntwrk/midnight-docs#1527](https://github.com/midnightntwrk/midnight-docs/issues/1527)

Official pages (checked against docs.midnight.network):
- https://docs.midnight.network/getting-started/installation
- https://docs.midnight.network/guides/local-proving
- https://docs.midnight.network/guides/windows-compact-setup

They still show forms such as:

```bash
docker run -p 6300:6300 midnightntwrk/proof-server:8.1.0 midnight-proof-server -v
```

and Compose:

```yaml
command: ['midnight-proof-server', '-v']
```

The image entrypoint is `bash -c` with the string `midnight-proof-server --port $PORT`. Arguments after the image name never reach the binary, so `-v`, `--network`, and `--port` are dropped. Verbose logging (needed to see the reason for a 400 bad input on proof-server 8.x) stays off.

Recommended form from the upstream issue (uses the support-matrix tag and env var):

```bash
docker run -p 127.0.0.1:6300:6300 -e MIDNIGHT_PROOF_SERVER_VERBOSE=true -v midnight-zk-params:/.cache/midnight midnightntwrk/proof-server:8.1.3
```

Or for the lab pin (8.1.0):

```bash
docker run -p 127.0.0.1:6300:6300 -e MIDNIGHT_PROOF_SERVER_VERBOSE=true -v midnight-zk-params:/.cache/midnight midnightntwrk/proof-server:8.1.0
```

This lab does not change the public proof-server image, the official docs site, the indexer, or the node. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
