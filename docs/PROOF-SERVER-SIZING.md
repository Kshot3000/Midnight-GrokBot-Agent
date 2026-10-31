# Proof server sizing (lab note)

Upstream: [midnightntwrk/midnight-docs#1634](https://github.com/midnightntwrk/midnight-docs/issues/1634)

Official sources only (no invented APIs or measurements):

- [Proving transactions locally](https://docs.midnight.network/guides/local-proving) (Workers and queueing)
- [Proof server errors](https://docs.midnight.network/api-reference/error-reference/proof-server-errors)
- [Networks and environments](https://docs.midnight.network/guides/networks-and-environments)
- [Ledger 8.1.3 release notes](https://docs.midnight.network/relnotes/ledger/ledger-8-1-3)
- [Run the proof server](https://docs.midnight.network/guides/run-proof-server)

## Documented facts

| Topic | What the docs state |
|-------|---------------------|
| Default workers | 2 (proofs built at the same time). More workers do not make a single proof faster; they share CPU and memory. |
| Queue | Pending jobs wait; capacity is configurable. `/ready` reports busy (503) when all workers are occupied. |
| Memory example | In one test, a circuit with `k` = 17 took about 1.5 GiB of memory in the container. |
| Platforms | `midnightntwrk/proof-server:8.1.3` is published for `linux/amd64` and `linux/arm64`. |
| Timeout / retries | `httpClientProofProvider` waits up to five minutes per request by default and retries up to three times on HTTP 500 or 503. |
| Slow proofs | Error reference lists "Slow proof generation" as large circuit or insufficient resources; allocate more CPU or memory. |
| Docker | Prerequisites require Docker Desktop; no numeric host memory floor is stated beyond the container example. |

These notes record only what the cited pages state. They do not claim a new measurement, do not size a production host, and do not claim to fix the public indexer or node.

See `packages/preprod-hello-stub/src/proof-server-sizing-note.mjs`.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0 (docs currently show image 8.1.3).

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
