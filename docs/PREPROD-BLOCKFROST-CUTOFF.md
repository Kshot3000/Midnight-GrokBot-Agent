# Preprod hosted endpoints and the 9 Oct Blockfrost move

Upstream: [midnightntwrk/midnight-docs#1504](https://github.com/midnightntwrk/midnight-docs/issues/1504)

Official networks page (read 2026-10-07): https://docs.midnight.network/guides/networks-and-environments

That page still says the `preview` and `preprod` endpoints are Midnight-hosted and need no token. It names:

- indexer `https://indexer.preprod.midnight.network/api/v4/graphql`
- node RPC `https://rpc.preprod.midnight.network`

Issue #1504 says those Preprod (and mainnet) Midnight-hosted indexer and RPC hosts shut down Fri 9 Oct 2026, 18:00 ET / 22:00 UTC, and that Preprod moves to Blockfrost the way mainnet did. The issue proposes, and this lab does not treat as already official:

| Service | Proposed in #1504 |
| --- | --- |
| Node RPC | `https://rpc.midnight-preprod.blockfrost.io?project_id=<token>` |
| Node WebSocket | `wss://rpc.midnight-preprod.blockfrost.io?project_id=<token>` |
| Indexer | `https://midnight-preprod.blockfrost.io/api/v0?project_id=<token>` |
| Indexer WebSocket | `wss://midnight-preprod.blockfrost.io/api/v0/ws?project_id=<token>` |

The indexer path in that proposal is `/api/v0`, not `/api/v4/graphql`. A preprod token is rejected on mainnet. Keep `BLOCKFROST_PROJECT_ID` out of source. Preview is unchanged in the issue. The proof server stays local on port 6300 (`midnightntwrk/proof-server:8.1.0`).

`packages/preprod-hello-stub/src/preprod-blockfrost-cutoff.mjs` classifies a URL and an error text a builder already observed (`ENOTFOUND` on a hosted host, Blockfrost 403 missing token, network token mismatch, old indexer path on a Blockfrost host). It does not call the public indexer or node and does not claim either is fixed.

Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Also read this run: servicedesk#223 (preprod RPC head goes backwards; already classified in `head-consistency.mjs`), servicedesk#236 (deploy errors that hide a runtime mismatch), example-hello-world#41 (unused axios / testcontainers). None of those are fixed here.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
