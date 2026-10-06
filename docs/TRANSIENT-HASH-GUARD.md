# transientHash is not a ledger identity

Upstream: [midnightntwrk/midnight-docs#1387](https://github.com/midnightntwrk/midnight-docs/issues/1387)

Official page: [Compact standard library exports](https://docs.midnight.network/compact/standard-library/exports)

Kapa traffic asked why `transientHash` and `transientCommit` are not guaranteed stable, and what type `disclose(deserialize<Boolean, 1>(flag))` has. This lab note answers from the published exports page. It does not edit midnight-docs. It does not fix the public indexer or node.

## What the published API says

- `transientHash<T>(value)` returns `Field`. It is not guaranteed to persist between upgrades. Do not derive state data from it. A consistency check in the same circuit is the documented use.
- `persistentHash<T>(value)` returns `Bytes<32>` and should be used to derive state data. A witness input that reaches the ledger through it still needs `disclose()`.
- `deserialize<T, #n>` reconstructs an event type from its canonical encoding. It can only be instantiated for an event type and that size. `ShieldedSpend` is a standard event with serialized size 32, so `deserialize<ShieldedSpend, 32>` returns `ShieldedSpend`. `Boolean` is not listed as an event type, so `deserialize<Boolean, 1>` is not a documented call. `disclose` does not change the type of a valid deserialize.
- `emit` accepts a standard event type only, and not from a constructor. This sample does not emit.

## Lab source

`contracts/hello-midnight/caller-auth.compact` is a different invariant. This one is `contracts/hello-midnight/transient-hash-guard.compact`.

- Language pin `>= 0.22 && <= 0.23` (Compact about 0.31.1). Not compiled in this change. Not deployed.
- `recordNote` compares two `transientHash<Bytes<32>>` results, then writes `disclose(persistentHash<Bytes<32>>(nonce()))` to `note`.
- `readSpend` binds `deserialize<ShieldedSpend, 32>` and asserts the nullifier is non-empty. It does not store that event as identity.

`packages/preprod-hello-stub/src/transient-hash-guard.mjs` is a source check. It does not run the Compact compiler.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
