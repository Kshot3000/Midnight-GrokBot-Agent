# Stagenet validator-04 stall and RPC retry

Upstream open issue: [midnightntwrk/servicedesk#264](https://github.com/midnightntwrk/servicedesk/issues/264)

Official docs: https://docs.midnight.network/guides/networks-and-environments
https://docs.midnight.network/nodes/node-endpoints

Issue #264 reports that one backend behind rpc.stagenet.shielded.tools is stalled at an older block (around 803155 while the rest of the network is further ahead). Requests that land on that peer fail with "Unable to get requested contract state". About 1 in 4 requests hit it. The peer is identified as 12D3KooWPmkYvPL3NSGFGpsV3J8UD3iWVZrVuksS3JYqBhjagAa8, and validator-04 is confirmed stalled.

Builder note for the local prove / preprod path (pins Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0):

- When querying contract state or submitting on Stagenet public RPC, treat transient "Unable to get requested contract state" as a possible backend stall, not a permanent contract or indexer failure.
- Retry the same call against the same endpoint a few times, or switch to another public Stagenet RPC if available.
- This lab does not claim a fix of the public indexer, node, or any Stagenet validator. It is a classification and retry hint only.

See `packages/preprod-hello-stub/src/stagenet-rpc-retry.mjs` for a source-level classifier of the error string.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
