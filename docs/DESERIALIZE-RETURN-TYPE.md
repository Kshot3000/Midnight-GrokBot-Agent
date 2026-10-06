# deserialize returns T; disclose does not retype it

Upstream: [midnightntwrk/midnight-docs#1387](https://github.com/midnightntwrk/midnight-docs/issues/1387)

The Compact Kapa review asked what type `disclose(deserialize<Boolean, 1>(flag))` has. The standard library signature is:

```
circuit deserialize<T, #n>(x: Bytes<n>): T;
```

The same page says `deserialize` can only be instantiated for an event type and its canonical serialized size. The language reference example returns `ShieldedSpend` from `deserialize<ShieldedSpend, 32>`. `disclose()` is not a type constructor. It clears the compiler's private-data check. The ledger write is what publishes the field.

This lab does not invent a Boolean encoding length and does not edit the auto-synced Compact reference.

- Contract: `contracts/hello-midnight/deserialize-type.compact`
- Check: `packages/preprod-hello-stub/src/deserialize-type-invariant.mjs`
- Official: https://docs.midnight.network/compact/standard-library/exports
- Official example: https://docs.midnight.network/compact/reference/compact-reference
- Official disclose: https://docs.midnight.network/compact/reference/explicit-disclosure

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Source only. Not compiled here. Not a public indexer or node fix.

Also read this run: servicedesk#236 (deploy errors that hide a runtime mismatch), servicedesk#235 (self-hosted node 1.0.300 genesis halt; public RPC users are not affected), example-hello-world#41 (unused axios / testcontainers). None of those are fixed here.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
