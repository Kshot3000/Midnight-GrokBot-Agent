# Third-party Preprod indexer tip behind the public chain

Upstream: [midnightntwrk/servicedesk#230](https://github.com/midnightntwrk/servicedesk/issues/230)

Official networks page: https://docs.midnight.network/guides/networks-and-environments

That page names the public Preprod indexer as `https://indexer.preprod.midnight.network/api/v4/graphql` and shows the height query `{ block { height } }`. It does not name `api-preprod.1am.xyz`.

Issue #230 reports the 1AM Preprod indexer stuck at block `2797947` for more than 4 hours while a public Preprod tip was `2825871` (difference `27924`). Transaction `e0f1b47301c0456d429b4059e4272396732cd140e02ff163692c3366d3874605` was visible on the public indexer at block `2821114` and missing on 1AM because that tip was below the transaction block. A wallet using the lagging indexer cannot discover that shielded output.

`packages/preprod-hello-stub/src/indexer-tip-lag.mjs` classifies heights a builder already observed. It parses only `data.block.height` from the documented query. It does not call 1AM, does not call the public indexer, and does not claim a fix of the public indexer or node.

Pins for this lab stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Also read this run: servicedesk#236 (deploy errors that hide a runtime mismatch), servicedesk#223 (preprod RPC head going backwards), midnight-docs#1502 (node 1.0.400 notes page missing), example-hello-world#41 (unused axios / testcontainers). None of those are fixed here.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
