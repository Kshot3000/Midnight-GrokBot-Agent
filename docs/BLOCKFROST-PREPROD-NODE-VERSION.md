# Blockfrost Preprod node reports "2.1.0-00000000000"

Upstream: https://github.com/midnightntwrk/servicedesk/issues/267

Official docs only:
- Support matrix: https://docs.midnight.network/relnotes/support-matrix — Preprod Network Node (Midnight) **1.0.400**
- Environments: https://docs.midnight.network/relnotes/network — Blockfrost is the public Preprod node RPC (`https://rpc.midnight-preprod.blockfrost.io`)
- Node toolkit: https://docs.midnight.network/nodes/node-toolkit — Preview, Preprod, and Mainnet run runtime spec version **1000300**; use toolkit 1.0.300

servicedesk#267 reports that the Blockfrost Preprod RPC `system_version` returns `2.1.0-00000000000`, while Foundation mainnet and preview RPCs return `1.0.400-<short-hash>`. The same call for `state_getRuntimeVersion` shows `specVersion` **1000300** on all three. Official matrix and toolkit pages list the Preprod node as 1.0.400 with that runtime.

This lab note does not invent APIs, does not call the public RPC, and does not claim a fix to the public indexer or node. It only records the published matrix pin and the reported client version string so builders on the pinned stack can see the mismatch.

## Official pins (quoted from support matrix)

Preprod:
- Node (Midnight): 1.0.400
- Compact toolchain: 0.31.1
- Compact runtime: 0.16.0
- Midnight.js: 4.1.1
- DApp Connector API: 4.0.1
- Proof server: 8.1.3 (lab tracks 8.1.0)

Runtime on the networks is specVersion 1000300.

## Reported observation (from the issue)

| Endpoint | system_version | runtime specVersion |
|---|---|---|
| Blockfrost preprod | 2.1.0-00000000000 | 1000300 |
| rpc.mainnet.midnight.network | 1.0.400-c338b9ac | 1000300 |
| rpc.preview.midnight.network | 1.0.400-87c0fbdb | 1000300 |

The zero commit hash and the 2.1.0 client string match no published node release tag in the issue's description. Official pages still list 1.0.400 for the Preprod network node.

## Lab helper

`packages/preprod-hello-stub/src/blockfrost-preprod-node-version.mjs` exports the official pin and a classifier for the reported strings. It does not perform RPC calls. LOCAL-TRUE.

Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
