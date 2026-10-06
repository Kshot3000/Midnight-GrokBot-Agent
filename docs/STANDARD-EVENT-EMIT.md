# Standard event emit

Upstream: [midnightntwrk/midnight-docs#1387](https://github.com/midnightntwrk/midnight-docs/issues/1387)

Kapa could not answer "how do I declare an event type and use the emit statement in a compact contract?" The Compact reference already answers it. A user-declared struct is not an event type.

https://docs.midnight.network/compact/reference/compact-reference

- `emit(e)` requires a standard event type. Anything else is a static error.
- The type of every `emit` form is `[]`.
- Emitting from the constructor, directly or indirectly, is a static error.
- Evaluation writes a `VersionedLogItem` (`version` 1, `eventType`, `data`). Encoding is the equivalent of `serialize`. Decode with `deserialize`.

https://docs.midnight.network/compact/standard-library/exports

`ShieldedSpend` is `{ nullifier: Bytes<32> }` and its serialized size is 32. The reference circuit is `emit(ShieldedSpend { nullifier: disclose(n) })` and `return deserialize<ShieldedSpend, 32>(x)`.

This lab does not edit midnight-docs. It does not fix the public indexer or node.

## Lab source

`contracts/hello-midnight/standard-event-emit.compact` pins `pragma language_version >= 0.23` (Compact ~0.31.1).

- The constructor increments `spends` and does not emit.
- `spend` emits `ShieldedSpend { nullifier: disclose(n) }` and returns `[]`.
- `deserializeShieldedSpend` returns `deserialize<ShieldedSpend, 32>(x)`.

`packages/preprod-hello-stub/src/standard-event-invariant.mjs` is a source check. It does not run the Compact compiler and does not deploy.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
