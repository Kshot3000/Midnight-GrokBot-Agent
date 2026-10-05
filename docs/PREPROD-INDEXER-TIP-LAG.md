# Preprod wallet indexer tip lag is not a missing public confirmation

Upstream: [midnightntwrk/servicedesk#230](https://github.com/midnightntwrk/servicedesk/issues/230)

Open report: the 1AM Preprod wallet indexer (`api-preprod.1am.xyz`) stayed at block `2797947` while the public Preprod chain continued. Confirmed transaction `e0f1b47301c0456d429b4059e4272396732cd140e02ff163692c3366d3874605` was visible through the public Midnight Preprod indexer at block `2821114`. A wallet that only reads the stalled indexer cannot discover the shielded output.

This lab does not fix the 1AM indexer, the public indexer, or the node. `packages/preprod-hello-stub/src/indexer-tip-lag.mjs` only classifies heights the caller already has:

- `wallet-indexer-behind-public-confirmation` — tx block is above the wallet indexer tip and at or below the public indexer tip. Do not treat the missing output as a prove or contract failure.
- `tx-above-wallet-indexer-tip` — tx block is above the wallet indexer tip, and no public indexer tip was supplied.
- `wallet-indexer-behind-public-tip` — wallet tip is behind the public chain tip.
- `aligned` — this sample does not explain a missing output by tip lag.

The documented public Preprod indexer is `https://indexer.preprod.midnight.network/api/v4/graphql` ([networks and environments](https://docs.midnight.network/guides/networks-and-environments)). The helper does not call that URL and does not invent a GraphQL field.

Related open issues read this run: [servicedesk#225](https://github.com/midnightntwrk/servicedesk/issues/225) (RPC 1010 hidden as a generic submission error), [servicedesk#226](https://github.com/midnightntwrk/servicedesk/issues/226) (subset deploy), [servicedesk#223](https://github.com/midnightntwrk/servicedesk/issues/223) (public RPC head can step backwards), [midnight-docs#902](https://github.com/midnightntwrk/midnight-docs/issues/902) (`ownPublicKey()` warning on generated reference pages), [example-hello-world#41](https://github.com/midnightntwrk/example-hello-world/issues/41) (unused axios and testcontainers).

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Local proof server, from https://docs.midnight.network/getting-started/installation :

```
docker run -p 6300:6300 midnightntwrk/proof-server:8.1.0 midnight-proof-server -v
```

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
