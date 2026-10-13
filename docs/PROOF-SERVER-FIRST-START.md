# Proof server first start: port not ready vs key-download exit

Upstream: [midnightntwrk/servicedesk#242](https://github.com/midnightntwrk/servicedesk/issues/242)

Related docs issue: [midnightntwrk/midnight-docs#1527](https://github.com/midnightntwrk/midnight-docs/issues/1527)

Official: [Local proving](https://docs.midnight.network/guides/local-proving).

On proof-server 8.x the container fetches about 34 MB of parameters and built-in keys before it binds port 6300. Each file gets three attempts with no pause and restarts from byte 0. If all three fail the process exits with code 1 and a "Giving up." log. Until the keys are in, nothing listens, so a client can see `ECONNRESET` or connection refused.

The lab classifier in `packages/preprod-hello-stub/src/proof-server-first-start.mjs` separates those two shapes from a healthy "listening on" line. It does not run Docker, does not contact a proof server, and does not claim to fix the public proof server, indexer, or node.

Recommended start (env var for verbose, cache volume so a later start skips the download):

```bash
docker run -p 127.0.0.1:6300:6300 -e MIDNIGHT_PROOF_SERVER_VERBOSE=true -v midnight-zk-params:/.cache/midnight midnightntwrk/proof-server:8.1.0
```

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
