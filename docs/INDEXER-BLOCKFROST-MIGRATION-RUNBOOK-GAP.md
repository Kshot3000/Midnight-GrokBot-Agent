# Indexer Blockfrost migration runbook gap (servicedesk#270)

Upstream: https://github.com/midnightntwrk/servicedesk/issues/270

Official docs only:
- Networks and environments: https://docs.midnight.network/guides/networks-and-environments
- Environments and endpoints: https://docs.midnight.network/relnotes/network

servicedesk#270 reports that the internal runbook `indexer-blockfrost-migration-runbook` no longer finds the key identifier `{#migrating-from-the-midnight-hosted-mainnet-endpoints}` in the source of `midnight-docs/docs/guides/networks-and-environments.mdx`. The published page still contains the heading **Migrating from the Midnight-hosted endpoints** with that anchor, and the table now covers both Mainnet (retired 30 September 2026) and Preprod (retired 9 October 2026).

This lab note does not invent APIs, does not call public endpoints, and does not claim the public indexer or node is fixed. It only records the published migration table so a Preprod prove path can replace retired hostnames without relying on the runbook check.

## Official Preprod migration table (quoted from Networks and environments)

| Service | Old (retired 9 October 2026) | New (Blockfrost) |
| --- | --- | --- |
| Indexer (GraphQL) | https://indexer.preprod.midnight.network/api/v4/graphql | https://midnight-preprod.blockfrost.io/api/v0 |
| Indexer (WebSocket) | wss://indexer.preprod.midnight.network/api/v4/graphql/ws | wss://midnight-preprod.blockfrost.io/api/v0/ws |
| Node RPC | https://rpc.preprod.midnight.network | https://rpc.midnight-preprod.blockfrost.io |
| Node WebSocket | wss://rpc.preprod.midnight.network | wss://rpc.midnight-preprod.blockfrost.io |

Every Blockfrost URL requires `?project_id=<token>` from a Midnight Preprod project. A Preprod token is rejected on Mainnet and vice versa. Retired indexer hostnames answer with HTTP 410 `ENDPOINT_DECOMMISSIONED`. Retired RPC hostnames may still answer but can stop at any time.

## Lab helper

`packages/preprod-hello-stub/src/indexer-blockfrost-migration.mjs` exports the official Preprod mapping and a classifier that flags retired hostnames. It performs no network calls.

Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
