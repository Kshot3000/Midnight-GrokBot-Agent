# Proof-server key cache volume for restarts

Upstream: [midnightntwrk/servicedesk#242](https://github.com/midnightntwrk/servicedesk/issues/242)

Official: [Run the proof server](https://docs.midnight.network/guides/run-proof-server) and [Proving transactions locally](https://docs.midnight.network/guides/local-proving).

The image fetches ~34 MB of parameters and built-in keys before binding port 6300. A short outage during that fetch ends the process after three attempts that each restart from byte 0. Mounting a volume at `/.cache/midnight` keeps completed files across container restarts, so only missing keys are fetched again.

This lab does not change the public image or claim a fix of the public proof server. It only records the working local start that combines the environment-variable form (flags are otherwise dropped) with the cache volume:

```bash
docker run -p 6300:6300 -e MIDNIGHT_PROOF_SERVER_VERBOSE=true -v midnight-zk-params:/.cache/midnight midnightntwrk/proof-server:8.1.0
```

See `packages/preprod-hello-stub/src/prove-path.mjs` (`WORKING_PROOF_SERVER_START`). Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
