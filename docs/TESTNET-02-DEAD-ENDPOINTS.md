# Retired testnet-02 endpoints still appear in older references (lab)

Upstream: [midnightntwrk/midnight-docs#1172](https://github.com/midnightntwrk/midnight-docs/issues/1172)

The issue reports that roughly 80 references to `testnet-02` remain across org repos after the Preview transition, and that the hosts no longer resolve. This lab note does not edit those repos and does not claim the public indexer or node is fixed.

Official page that already states the retirement (checked against https://docs.midnight.network/guides/networks-and-environments):

> The testnet-02 name is retired. Older articles and tools sometimes reference a network named `testnet-02`. Midnight retired that network, and its endpoints, such as `rpc.testnet-02.midnight.network` and `indexer.testnet-02.midnight.network`, no longer resolve. Use `preview` or `preprod` instead, with the endpoints listed in the Environment reference.

Current public networks named on that page:

- `undeployed` — local Docker stack (node `http://localhost:9944`, indexer `http://localhost:8088/api/v4/graphql`, proof server `http://localhost:6300`)
- `preview` — Midnight-hosted public test network (no Blockfrost token)
- `preprod` — Blockfrost-served public test network (project token required)
- `mainnet` — Blockfrost-served production network (project token required)

The v0 archive still hosts the older migration guide at https://docs.midnight.network/0.0.0/how-to/migrate-from-testnet-02-to-preview. That page is marked Legacy and lists Compact 0.27.0 / midnight-js v3. This lab pins Compact ~0.31.1 / language ~0.23 and midnight-js 4.1.1; do not treat the archived version numbers as current.

Lab classifier (no network calls): `packages/preprod-hello-stub/src/testnet-02-dead-endpoints.mjs`. It rejects a config that still names `testnet-02` as a network ID or host. It does not invent a replacement endpoint beyond the names already published on the networks guide.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This note does not invent APIs.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
