# Proving topology: local vs undocumented hosted

Upstream: [midnightntwrk/midnight-docs#1383](https://github.com/midnightntwrk/midnight-docs/issues/1383)

Official guides:
- [Proving transactions locally](https://docs.midnight.network/guides/local-proving)
- [Run the proof server](https://docs.midnight.network/guides/run-proof-server)

Issue #1383 notes that developers cannot tell which proving setup is supported, and that the question has a privacy dimension. The published guides cover running a local proof server on port 6300 and mention a remote machine you control over an encrypted channel. They do not name a wallet-delegated proving API or a public hosted proof server.

Lace documents one option: Settings → Midnight → Local, `http://localhost:6300`.

This lab classifies a prove URL without contacting any proof server:

- local host + port 6300 → documented local path (proof server sees witness data; it does not hold wallet keys)
- HTTPS URL on a machine the caller marks as controlled → allowed by the run-proof-server guide
- wallet-delegated, public-hosted, or stranger URL → undocumented; do not send witnesses there

Classifier: `packages/preprod-hello-stub/src/prove-topology.mjs`.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This does not claim a fix of the public proof server, indexer, or node, and does not invent a wallet-delegated API.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
