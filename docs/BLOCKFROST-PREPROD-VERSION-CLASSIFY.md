# Blockfrost Preprod RPC client version vs matrix pin (lab)

Upstream: https://github.com/midnightntwrk/servicedesk/issues/267

Official docs only:
- https://docs.midnight.network/relnotes/support-matrix — Preprod Network Node (Midnight) **1.0.400**
- https://docs.midnight.network/relnotes/network — Blockfrost public Preprod RPC
- https://docs.midnight.network/nodes/node-toolkit — runtime specVersion **1000300**

servicedesk#267 reports `system_version` on the Blockfrost Preprod RPC returns `2.1.0-00000000000` (zero commit hash). Foundation mainnet and preview RPCs return `1.0.400-<short-hash>`. `state_getRuntimeVersion` shows `specVersion` 1000300 on all three. Official matrix lists the Preprod node as 1.0.400.

This lab note does not call the public RPC, does not invent APIs, and does not claim a fix to the public indexer or node. It only records the published matrix pin and the reported client string so builders on the pinned stack (Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0) can classify the mismatch.

Local classifier: `packages/preprod-hello-stub/src/blockfrost-preprod-version-classify.mjs`. It returns `unknown-client-build` for the reported string and `matches-matrix` for any `1.0.400-*` string. No network.

## Reported observation (from the issue)

| Endpoint | system_version | runtime specVersion |
|---|---|---|
| Blockfrost preprod | 2.1.0-00000000000 | 1000300 |
| rpc.mainnet.midnight.network | 1.0.400-c338b9ac | 1000300 |
| rpc.preview.midnight.network | 1.0.400-87c0fbdb | 1000300 |

The zero hash and 2.1.0 client match no published node release tag. Official pages still list 1.0.400 for the Preprod network node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
