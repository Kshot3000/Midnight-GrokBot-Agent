# Preprod Blockfrost system_version decode

Upstream: [midnightntwrk/servicedesk#267](https://github.com/midnightntwrk/servicedesk/issues/267)

Official:

- https://docs.midnight.network/relnotes/support-matrix
- https://docs.midnight.network/nodes/node-endpoints

Issue #267 (opened 2026-10-21) reports that Blockfrost's Preprod RPC (`https://rpc.midnight-preprod.blockfrost.io`) answers `system_version` with `2.1.0-00000000000`. No final 2.1.0 release exists in `midnightntwrk/midnight-node`; only beta and rc tags share the crate version 2.1.0. The all-zero short hash indicates a non-Earthly build. Foundation RPCs report `1.0.400-<short-hash>`. Runtime `specVersion` is `1000300` on all three, so only the client binary differs.

This lab does not call the RPC, does not claim the public node or indexer is fixed, and does not invent a version string.

Classifier: `packages/preprod-hello-stub/src/preprod-blockfrost-version-decode.mjs`

- Detects the reported `2.1.0-00000000000` form.
- Flags an all-zero commit suffix.
- Contrasts it with the matrix pin `1.0.400`.
- Leaves a real short hash alone.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
