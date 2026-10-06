# Ledger successfulSegments polarity

Upstream: [midnightntwrk/servicedesk#186](https://github.com/midnightntwrk/servicedesk/issues/186)

Open ticket title: `TransactionResult.successfulSegments` is inverted: true marks the segments that FAILED. Status when read this run: open, in review, ledger component.

Official type only, no polarity:

https://docs.midnight.network/api-reference/ledger/classes/TransactionResult

```
readonly optional successfulSegments: Map<number, boolean>;
```

A caller that treats `true` as success will keep the failed segment and drop the one that applied. This lab does not patch `@midnight/ledger` and does not claim the public node or indexer is fixed.

`packages/preprod-hello-stub/src/segment-polarity.mjs` reads a result the caller already has. Under the upstream report, `true` is recorded as `reportedFailed`. Indexer GraphQL is a different field, `transactionResult.segments.success`, documented at https://docs.midnight.network/api-reference/midnight-indexer . This helper does not rewrite that field.

Also open this run, already covered here and left alone: [#235](https://github.com/midnightntwrk/servicedesk/issues/235) genesis sync halt, [#236](https://github.com/midnightntwrk/servicedesk/issues/236) unnamed deploy runtime mismatch, [#225](https://github.com/midnightntwrk/servicedesk/issues/225) bare 1010. Docs issue [midnight-docs#1494](https://github.com/midnightntwrk/midnight-docs/issues/1494) (support matrix tags that do not resolve) and example-hello-world [#41](https://github.com/midnightntwrk/example-hello-world/issues/41) (unused axios and testcontainers) were read and not edited upstream.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
