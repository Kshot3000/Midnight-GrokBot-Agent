# Proof-server /ready is not the same as unreachable

Upstream: [midnightntwrk/midnight-docs#1377](https://github.com/midnightntwrk/midnight-docs/issues/1377)

That Kapa review lists "Proof server unreachable on port 6300" as one of the largest pasted-error clusters (38 chat questions). The official local-proving page already separates a refused connection from a live server that is only queuing.

Official page, read 2026-10-07: https://docs.midnight.network/guides/local-proving

Documented checks, not invented:

- `Error: connect ECONNREFUSED 127.0.0.1:6300` means the container is not accepting connections.
- Start pin: `docker run -p 6300:6300 midnightntwrk/proof-server:8.1.0 midnight-proof-server -v`
- `GET /health` returns `{"status":"ok","timestamp":"..."}`.
- `GET /version` returns `8.1.0` for the pin on that page. The `latest` tag is called out as lagging.
- `GET /ready` returns `jobsProcessing`, `jobsPending`, and `jobCapacity`. If `jobsPending` climbs while `jobsProcessing` stays flat, jobs are queuing. Default proving workers are two (`--num-workers`). The startup `workers: 12` line is HTTP workers, not proving workers.

The proof server's only transaction step is generating proofs. Balancing and submission are later wallet and node steps. This lab file does not dial port 6300 and does not claim the public proof server, indexer, or node is fixed.

Lab pin stays Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Classifier: `packages/preprod-hello-stub/src/proof-ready-decode.mjs`

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
