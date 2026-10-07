# Node 1.0.400 notes still missing

Upstream: [midnightntwrk/midnight-docs#1502](https://github.com/midnightntwrk/midnight-docs/issues/1502)

Related builder impact: [midnightntwrk/servicedesk#235](https://github.com/midnightntwrk/servicedesk/issues/235)

Official node index, read 2026-10-07: https://docs.midnight.network/relnotes/node

That page still marks **Release 1.0.300** LATEST (22 September 2026). Its summary still says a node that syncs Mainnet from genesis with v1.0.300 stops at block 1788979, and that the node team plans to fix this in v1.0.400. The published 1.0.300 notes repeat that known issue: https://docs.midnight.network/relnotes/node/node-1-0-300

Issue #1502 says there is no docs page for node 1.0.400. The newest DynamicList entry is 1.0.300. The upstream tag is https://github.com/midnightntwrk/midnight-node/releases/tag/node-1.0.400 (published 2026-10-06). The missing docs URL is https://docs.midnight.network/relnotes/node/node-1-0-400

The tag body (not a docs page) says the upgrade is binary-only, `spec_version` stays `1_000_300`, ledger 8 host functions move to 8.1.3, and a node halted at #1788979 resumes after a restart on 1.0.400 with no resync. It also says supported compactc and midnight-js output does not emit the non-canonical field encodings or `noop 0` that 8.1.3 rejects. This lab does not publish that binary and does not fix the public indexer or node.

Lab pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. The node workspace listing compactc 0.30.0 is a build pin on that tag, not a lab compiler change.

`packages/preprod-hello-stub/src/node-1400-notes-gap.mjs` classifies a pasted docs index against the published tag. It does not dial a node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
