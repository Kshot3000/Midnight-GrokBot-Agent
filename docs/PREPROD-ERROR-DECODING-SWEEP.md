# Preprod error decoding sweep (lab)

This lab read open issues in midnightntwrk/servicedesk, midnightntwrk/midnight-docs, and midnightntwrk/example-hello-world. It does not push to those orgs and does not claim to fix the public indexer, node, or proof server.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Official docs only: https://docs.midnight.network/.

## Upstream issues covered by existing lab classifiers

- [servicedesk#243](https://github.com/midnightntwrk/servicedesk/issues/243): midnight-js proof provider drops the proof-server response body and reports a timeout as "The user aborted a request." Lab: `packages/preprod-hello-stub/src/proof-provider-body-decode.mjs`, `proof-timeout-decode.mjs`, `builtin-key-decode.mjs`.
- [servicedesk#225](https://github.com/midnightntwrk/servicedesk/issues/225): Node RPC 1010 "Transaction would exhaust the block limits" surfaces only as a generic submission error. Lab: `docs/PREPROD-RPC-1010-DECODE.md`.
- [servicedesk#252](https://github.com/midnightntwrk/servicedesk/issues/252): proof-server 9.0.0-rc.9 DUST-spend proofs rejected by Stagenet with 1010 Custom error 170. Lab pins 8.1.0; classifier in `dust-spend-proof-170-decode.mjs`.
- [servicedesk#236](https://github.com/midnightntwrk/servicedesk/issues/236): deploy construction errors do not name a runtime mismatch. Lab: `docs/RUNTIME-MISMATCH-DECODE.md`.
- [servicedesk#251](https://github.com/midnightntwrk/servicedesk/issues/251): Wallet SDK DUST sync never notices a silent subscription. Lab: `docs/DUST-SILENT-SUBSCRIPTION.md`.
- [midnight-docs#1554](https://github.com/midnightntwrk/midnight-docs/issues/1554): missing wallet-builder guide. Lab: `docs/WALLET-BUILDER-GUIDE-GAP.md`.
- [example-hello-world#41](https://github.com/midnightntwrk/example-hello-world/issues/41): unused axios and testcontainers. Lab: `docs/HELLO-WORLD-UNUSED-DEPS.md`.

All classifiers are source-level or local. They do not call the public proof server, indexer, or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
