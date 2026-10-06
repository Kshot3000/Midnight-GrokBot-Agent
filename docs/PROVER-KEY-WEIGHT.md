# Prover-key weight and the local proof server

Upstream: [midnightntwrk/servicedesk#203](https://github.com/midnightntwrk/servicedesk/issues/203)

Official docs:

- [Deploying and operating a contract](https://docs.midnight.network/guides/deploy-and-operate) — `proofProvider` sends proof requests to a proof server.
- [Getting started / installation](https://docs.midnight.network/getting-started/installation) — start a proof server and point the DApp at it (documented local port 6300).

The report measures prover keys from about 45 MB to 570 MB per circuit when secp256k1 ECDSA or BIP-340 checks are expanded in Compact. Those sizes are the reporter's measurements on Compact 0.33.0, language 0.25, and midnight-js 5.0.0-beta.6. They are not a published node limit, and this lab does not copy that toolchain.

This repo stays on Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, and `midnightntwrk/proof-server:8.1.0`. There is no stock key-reference API in the docs, so this change does not invent one. A hosted prover still sees witnesses; use a machine you control, not an indexer GraphQL URL.

`packages/preprod-hello-stub/src/prover-key-weight.mjs` flags `secp256k1EcdsaVerify`, `ecMul`, `ecMulGenerator`, and `ecAdd` in Compact source and keeps the proof URL on `http://localhost:6300`. It does not compile, prove, or contact a server. It does not fix the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
