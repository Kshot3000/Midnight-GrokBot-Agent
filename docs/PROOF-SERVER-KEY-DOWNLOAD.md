# Proof-server exits if a key download fails three times

Upstream: [midnightntwrk/servicedesk#242](https://github.com/midnightntwrk/servicedesk/issues/242)

Official: [Proving transactions locally](https://docs.midnight.network/guides/local-proving) and [Run the proof server](https://docs.midnight.network/guides/run-proof-server).

On proof-server 8.x the process fetches about 34 MB of public parameters and built-in keys from `https://srs.midnight.network/` before it binds port 6300. Each file gets three attempts with no pause between them, and every attempt restarts from byte 0. If all three fail the process exits with code 1 and a log line that ends in `Giving up.`.

Until every key is in, nothing listens on 6300. A client that connects early sees `read ECONNRESET` or connection refused. There is no `/health` that distinguishes "starting" from "down".

This lab does not change the public image. It only classifies the two strings a builder already has:

- `Failed to fetch data from … after 3 attempts. Giving up.`
- `ECONNRESET` / connection refused while the container is still on its first start

Decoder: `packages/preprod-hello-stub/src/proof-server-key-download.mjs`

Practical notes that stay inside the official surface:

- Retry the container. A later start that finds the keys already in the cache is fast.
- Mount a volume at `/.cache/midnight` (`-v midnight-zk-params:/.cache/midnight`) so the keys survive container removal.
- `MIDNIGHT_PROOF_SERVER_NO_FETCH_PARAMS=true` only defers the downloads to first use; it does not make the server work fully offline on an empty cache.
- `MIDNIGHT_PARAM_SOURCE` can point at a mirror you control.

Lab pin remains `midnightntwrk/proof-server:8.1.0`. This does not claim a fix of the public proof server, indexer, or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
