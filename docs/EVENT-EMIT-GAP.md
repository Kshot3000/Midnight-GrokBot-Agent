# Compact event emit (midnight-docs#1387)

Lab example for the Compact reference gap reported in
[midnightntwrk/midnight-docs#1387](https://github.com/midnightntwrk/midnight-docs/issues/1387).
Kapa could not answer "how do I declare an event type and use the emit statement in a compact contract?"

## Official behavior

From [Compact reference](https://docs.midnight.network/compact/reference/compact-reference):

- Events are emitted via `emit(e)` where `e` is an expression of a standard event type.
- The type of every `emit` form is `[]`.
- Emitting a non-standard event type is a static error.
- Emitting from the constructor is a static error.

Standard event types are listed in the [Compact standard library exports](https://docs.midnight.network/compact/standard-library/exports), for example `ShieldedSpend`.

## Lab contract

`contracts/hello-midnight/event-emit.compact` shows a circuit that emits `ShieldedSpend` and increments a counter. It uses the pinned language pragma `>= 0.22 && <= 0.23` and does not invent APIs.

```compact
export circuit spendAndTick(nullifier: Bytes<32>): [] {
  emit(ShieldedSpend { nullifier: disclose(nullifier) });
  rounds.increment(1);
}
```

## Pins (unchanged)

- Compact ~0.31.1 / language ~0.23
- midnight-js 4.1.1
- DApp Connector 4.0.1
- proof-server 8.1.0

This does **not** fix the public indexer, node, or upstream Compact docs. It is a local source example that cites the open issue.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
