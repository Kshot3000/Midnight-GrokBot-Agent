# Node 1.0.300 genesis-sync halt

Upstream: [midnightntwrk/servicedesk#235](https://github.com/midnightntwrk/servicedesk/issues/235)

Official node index: https://docs.midnight.network/relnotes/node

That page, read 2026-10-05, still lists **Release 1.0.2** as SUPPORTED and says runtime 1.0.300 imports host functions that node 1.0.2 lacks, so Preview, Preprod, and Mainnet should run node and toolkit 1.0.300. It does not document a genesis-sync halt or a node 1.0.400 release.

Support matrix node pin: https://docs.midnight.network/relnotes/support-matrix (Node 1.0.300). Lab proof-server stays 8.1.0. Compact stays ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1.

Issue #235 says a self-hosted mainnet node on 1.0.300 with an empty database stops at block **#1788979** because block **#1788980** is rejected (`Intent TTL has expired`, `Invalid(Custom(182))`). Public RPC, indexer, and proof-server callers are not on this path. Draft notes say node 1.0.400 resumes a halted node with no resync, and that the release is not published. This lab does not publish that binary and does not fix the public indexer or node.

`packages/preprod-hello-stub/src/genesis-sync-halt.mjs` classifies a pasted log. It does not dial a node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
