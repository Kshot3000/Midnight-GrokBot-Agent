# Node 1.0.300 release-notes gap

Upstream: [midnightntwrk/midnight-docs#1390](https://github.com/midnightntwrk/midnight-docs/issues/1390)

Official node index, read 2026-10-05: https://docs.midnight.network/relnotes/node

That index marks **Release 1.0.2** SUPPORTED (18 September 2026). It does not list a 1.0.300 notes page. https://docs.midnight.network/relnotes/node/node-1-0-300 returns Page Not Found.

The published 1.0.2 notes (https://docs.midnight.network/relnotes/node/node-1-0-2) already tell operators what the missing page would have to cover:

- Preview, Preprod, and Mainnet run runtime 1.0.300 (`spec_version` `1_000_300`).
- That runtime imports version 2 `Ledger8Bridge` host functions that node v1.0.2 does not provide, so a v1.0.2 node cannot import blocks from that runtime upgrade onward.
- Toolkit 1.0.0, which ships with the 1.0.2 release, fails with `UnsupportedBlockVersion(1000300)` on those blocks.
- The same page says to run node v1.0.300 and toolkit 1.0.300 on those networks, and links the GitHub tag https://github.com/midnightntwrk/midnight-node/releases/tag/node-1.0.300.
- A known issue on the 1.0.2 page: the block timestamp (`tblock`) correction for midnight-node#1924 is not in 1.0.2; the notes say it ships in node v1.0.300.

This lab does not copy a 1.0.300 changelog. The docs page does not exist. It does not change example-hello-world, and it does not fix the public indexer or node.

`packages/preprod-hello-stub/src/node-notes-gap.mjs` classifies that gap. Lab pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Related open tickets read this run, not fixed here: servicedesk#235 (self-hosted 1.0.300 genesis halt, draft 1.0.400), servicedesk#236 (runtime mismatch deploy errors), example-hello-world#41 (unused axios and testcontainers).

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
