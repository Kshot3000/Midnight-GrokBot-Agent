# Proof server sizing note (midnight-docs#1634)

Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1634

Official docs only:
- https://docs.midnight.network/guides/local-proving — Workers and queueing
- https://docs.midnight.network/api-reference/error-reference/proof-server-errors — Slow proof generation
- https://docs.midnight.network/guides/run-proof-server
- https://docs.midnight.network/relnotes/support-matrix

## Reported gap

midnight-docs#1634 records that builders ask for proof-server hardware requirements (memory, CPU, disk, platforms, typical proving times). The docs do not contain a full sizing section. Agents often answer that the sources do not list hardware requirements.

## What the official pages do say

From Local proving (Workers and queueing), proof server 8.1.3:
- Default number of proving workers is 2. Each `/check` and `/prove` request is one job.
- Job capacity default is 0 (no limit). With a limit set, a full queue returns HTTP 429 "Job Queue full" and `/ready` returns 503 with status busy.
- "Proving time and memory grow with the size of the circuit. In one test, proving a circuit with a `k` value of 17 took about 1.5 GiB of memory in the container."
- "To size a server, time your own circuits: the proof server logs how long each request took."
- The startup line that lists workers counts HTTP workers (following processor cores), not proving workers.
- Settings: `MIDNIGHT_PROOF_SERVER_NUM_WORKERS` (default 2), `MIDNIGHT_PROOF_SERVER_JOB_CAPACITY` (default 0), `MIDNIGHT_PROOF_SERVER_JOB_TIMEOUT` (default 600s).
- Parameter cache lives in `/.cache/midnight` inside the container; a volume mount avoids re-downloads.

From Proof server errors:
- Slow proof generation: "Large circuit or insufficient resources — Allocate more CPU or memory to the proof server container."

The support matrix pins Preprod/Mainnet proof server to 8.1.3 (lab tracks 8.1.0). No official page lists a full RAM/CPU/disk table, ARM64 vs amd64 support, or measured laptop times for a contract call versus a shielded or DUST spend. This note does not invent those figures.

## Lab artifact

`packages/preprod-hello-stub/src/proof-server-sizing-1634.mjs` exports the published data points and a reminder to measure local circuits. LOCAL-TRUE. It does not call a proof server, indexer, or node, and does not claim a fix of the public indexer or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This lab note does not change upstream docs.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
