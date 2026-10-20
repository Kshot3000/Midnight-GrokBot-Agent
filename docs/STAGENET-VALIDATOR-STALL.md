# Stagenet validator-04 stall and contract-state failures

Upstream: [midnightntwrk/servicedesk#264](https://github.com/midnightntwrk/servicedesk/issues/264)

One backend behind `rpc.stagenet.shielded.tools` was reported stalled at block 803,155 (from 2026-10-08) while the rest of the network was near 948,000. Requests that land on the stalled peer (about 1 in 4, via 54.217.86.134) fail with `Unable to get requested contract state`. The peer id given is `12D3KooWPmkYvPL3NSGFGpsV3J8UD3iWVZrVuksS3JYqBhjagAa8`. Telemetry: https://telemetry-internal.shielded.tools/#list/0x2f76825abc239fecf6107c9df99016de57037b451ae57a4394b76c8cf53a9491.

This lab does not operate nodes, does not claim the public indexer or node is fixed, and does not invent an RPC method. Official docs already document `midnight_contractState` and that indexer `GetContractState` means the indexer cannot fetch contract state from the node. When a builder sees the exact string on Stagenet, the first check is whether the request hit a lagged validator rather than a bad contract address or a Compact runtime mismatch.

`packages/preprod-hello-stub/src/stagenet-validator-stall.mjs` classifies the reported error string and the peer id. It does not call any network. `contracts/hello-midnight/stagenet-stall-note.compact` is a no-circuit pin for the same issue.

Official:

- https://docs.midnight.network/concepts/network-architecture/rpc-networking
- https://docs.midnight.network/api-reference/error-reference/indexer-errors
- https://docs.midnight.network/nodes/error-codes

Pins used by this lab: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Also read this run: servicedesk#254 (faucet amount unit), midnight-docs#1564 (runtime API reference version), example-hello-world#41 (unused deps). None of those are fixed here.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
