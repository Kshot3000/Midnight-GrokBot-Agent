# Proof-server start: use the environment variable, not dropped flags

Upstream:
- [midnightntwrk/midnight-docs#1527](https://github.com/midnightntwrk/midnight-docs/issues/1527) — official pages still show docker run and Compose forms that drop `-v`, `--network`, `--port`.
- [midnightntwrk/servicedesk#242](https://github.com/midnightntwrk/servicedesk/issues/242) — image entrypoint is `bash -c` with a fixed command string; extra arguments never reach the binary. Also exits if a key download fails three times in a row.

Official pages (checked against docs.midnight.network on 2026-10-14):
- https://docs.midnight.network/guides/local-proving — `docker run … midnight-proof-server -v` and `command: ['midnight-proof-server', '-v']`
- https://docs.midnight.network/getting-started/installation — same docker run form
- Example pages still show `-- midnight-proof-server -v` on 8.0.3

The compatibility matrix lists proof-server 8.1.3. This lab continues to pin **8.1.0** as instructed.

## Working form for the lab pin

```bash
docker run -p 127.0.0.1:6300:6300 -e MIDNIGHT_PROOF_SERVER_VERBOSE=true midnightntwrk/proof-server:8.1.0
```

Give no command. Verbose logging (needed to see the reason for a 400 `bad input` on 8.x) is controlled by the environment variable. Pair with a volume at `/.cache/midnight` if you want the keys to survive container restarts. `MIDNIGHT_PROOF_SERVER_NO_FETCH_PARAMS=true` only defers downloads; it does not make the server work fully offline on an empty cache.

Port inside the container is set with `PORT`, not a dropped `--port` flag.

## Local classifier

`packages/preprod-hello-stub/src/proof-server-env-form.mjs` flags the broken official snippets and confirms the env-var form. It does not run Docker, does not contact a proof server, and does not invent APIs.

This note does not claim that the public proof-server image, the official docs site, the indexer, or the node have been fixed.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
