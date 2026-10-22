# Stagenet validator-04 stall can surface as Unable to get requested contract state

Upstream: [midnightntwrk/servicedesk#264](https://github.com/midnightntwrk/servicedesk/issues/264)

Official docs only: https://docs.midnight.network/

Issue #264 reports one backend behind `rpc.stagenet.shielded.tools` stuck at block 803,155 (observed 2026-10-08) while the rest of the network was near 948,000. Calls that land on that backend fail with `Unable to get requested contract state`. The peer is identified as `12D3KooWPmkYvPL3NSGFGpsV3J8UD3iWVZrVuksS3JYqBhjagAa8` (validator-04). Telemetry: https://telemetry-internal.shielded.tools/#list/0x2f76825abc239fecf6107c9df99016de57037b451ae57a4394b76c8cf53a9491

The official networks guide at https://docs.midnight.network/guides/networks-and-environments documents undeployed, preview, preprod, and mainnet. It does not list a public Stagenet endpoint. The indexer error reference at https://docs.midnight.network/api-reference/error-reference/indexer-errors lists `GetContractState` as an internal ledger / chain-indexer failure: "Failed to retrieve contract state" / "The indexer cannot fetch contract state from the node. Node RPC failure; check node logs and connectivity."

When a load-balanced public RPC returns that message on a minority of requests, the cause can be a single stalled validator rather than a missing contract or a client bug. Retry the same call, or point at a different endpoint if you have one. This lab does not call Stagenet, does not claim a fix of the public node or indexer, and does not invent APIs.

## Additional lab guidance

A minority of requests failing with the contract-state message while other requests succeed is consistent with a single stalled backend in a load-balanced set. The official error reference points at node RPC failure; the issue supplies the concrete stalled-validator example on Stagenet. Builders on Preprod should still check their own endpoint health and the support matrix pin before attributing the same string to this Stagenet report.

`packages/preprod-hello-stub/src/stagenet-stall-decode.mjs` classifies the exact error string from the issue and returns a retry hint. It does not open a network connection.

Pins used by this lab: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Also read this run: servicedesk#254 (faucet amount unit), servicedesk#252 (proof-server 9.0.0-rc.9 DUST proofs), midnight-docs#1577 (bboard tutorial retirement), midnight-docs#1569 (DApp Connector stale lines), example-hello-world#41 (unused deps). None of those are fixed here.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
