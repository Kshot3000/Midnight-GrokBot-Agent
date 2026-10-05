# partialSuccess segment polarity

Upstream: [midnightntwrk/servicedesk#186](https://github.com/midnightntwrk/servicedesk/issues/186)

Official ledger `TransactionResult` exposes optional `successfulSegments: Map<number, boolean>` and `type: "success" | "partialSuccess" | "failure"` ([TransactionResult](https://docs.midnight.network/api-reference/ledger/classes/TransactionResult)). The field exists for partial success. The issue reports it is undefined on both `success` and `failure`.

The same issue measured `@midnight-ntwrk/ledger-v9@1.0.0-rc.3`: the wasm binding writes `v.is_err()` into the map. A `true` entry is a segment whose update failed. A `false` entry is a segment whose update applied. Reading `successfulSegments.get(id) === true` as "landed" is wrong in both directions. The all-stale control in that report is the clear case: nothing applied, and every failed segment is still `true`.

This lab only interprets a map the caller already has. `packages/preprod-hello-stub/src/segment-polarity.mjs` flips the boolean on `partialSuccess` and leaves `success` / `failure` without a per-segment map. It does not patch midnight-ledger, the public node, or the public indexer.

Indexer GraphQL `Segment.success` is a different field, documented as "Successful or not" ([Segment](https://docs.midnight.network/api-reference/midnight-indexer/types/objects/segment)). This note does not claim that GraphQL boolean shares the ledger-wasm inversion.

Pins for this lab: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
