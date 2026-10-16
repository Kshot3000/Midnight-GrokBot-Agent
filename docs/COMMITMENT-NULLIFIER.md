# Commitment/nullifier pattern for single-use authorization

Upstream: [midnightntwrk/midnight-docs#1387](https://github.com/midnightntwrk/midnight-docs/issues/1387)

Official source: https://docs.midnight.network/concepts/how-midnight-works/keeping-data-private (section "The commitment/nullifier pattern").

- Store authorized identities as commitments in a `HistoricMerkleTree`. Membership proofs hide which leaf was used and accept earlier roots.
- On use, derive a nullifier with a distinct domain separator (`persistentHash` of a pad + secret), assert it is absent from a `Set`, then insert it. This prevents re-use while still hiding which commitment was spent.
- The `authPath.leaf == publicKey(sk)` assert is required. `findAuthPath` is a witness; without the binding, any valid path satisfies `checkRoot`.
- Domain separators must differ between the commitment and the nullifier so the same secret cannot produce colliding values.
- Extra lab assert: the secret must be non-empty.

Lab contract: `contracts/hello-midnight/commitment-nullifier.compact`

This file is not compiled in the lab and is not a deploy. It does not invent APIs; the shapes are taken from the official private-data page. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This note does not claim any fix of the public indexer, node, or Compact compiler.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
