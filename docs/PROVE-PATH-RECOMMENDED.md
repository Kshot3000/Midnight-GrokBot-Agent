# Recommended prove-server start command

Upstream: [midnightntwrk/servicedesk#242](https://github.com/midnightntwrk/servicedesk/issues/242)

Docs: [midnightntwrk/midnight-docs#1527](https://github.com/midnightntwrk/midnight-docs/issues/1527)

Official: [Local proving](https://docs.midnight.network/guides/local-proving)

The `midnightntwrk/proof-server` image entrypoint is `bash -c` with the fixed command `midnight-proof-server --port $PORT`. Any arguments written after the image name (including `-v`, `--network preprod`, or Compose array forms) are dropped and never reach the binary.

Verbose logging (needed to see the reason behind a 400 `bad input` on 8.x) must be enabled with the environment variable:

```bash
docker run -p 127.0.0.1:6300:6300 -e MIDNIGHT_PROOF_SERVER_VERBOSE=true midnightntwrk/proof-server:8.1.0
```

Lab pin remains `8.1.0` (the version used by the published local-proving guide). The support-matrix page lists `8.1.3`; that skew is tracked separately.

This note does not run Docker, does not contact a proof server, and does not claim a fix of the public indexer, node, or proof-server image.

Helper: `packages/preprod-hello-stub/src/prove-path-recommended.mjs`

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
