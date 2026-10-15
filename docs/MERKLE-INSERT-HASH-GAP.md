# MerkleTree.insert vs insertHash path recovery is not documented

Upstream: [midnightntwrk/midnight-docs#63](https://github.com/midnightntwrk/midnight-docs/issues/63)

Official ledger ADT page (checked 2026-10-15): https://docs.midnight.network/compact/reference/ledger-adt

- `MerkleTree.insert(item: value_type)` — "Inserts a new leaf at the first free index in this Merkle tree."
- `MerkleTree.insertHash(hash: Bytes<32>)` — "Inserts a new leaf with a given hash at the first free index in this Merkle tree."
- `findPathForLeaf(leaf: value_type)` is TypeScript-only and "Returns undefined if no such leaf exists."
- `pathForLeaf(index, leaf)` "is an error to call this if this leaf is not contained at the given index."

The open issue shows that after both circuits run, a path built for the raw value succeeds for the `insert` leaf and fails for the `insertHash` leaf. The page does not define the transformation (if any) that `insertHash` applies before the leaf is stored, so a builder cannot recreate the stored leaf from the preimage using only the published text.

This lab does not invent that transformation, does not compile or deploy the sample, and does not claim the public indexer or node was fixed. Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Lab files:

- `contracts/hello-midnight/merkle-insert-hash.compact` — language 0.23 source that uses the documented `insert` and `insertHash` forms and a `checkRoot` test. No hash formula.
- `packages/preprod-hello-stub/src/merkle-insert-hash-invariant.mjs` — source check only.

Workaround until the docs clarify the leaf encoding: keep the value you will later prove as the leaf you pass to `insert`, and treat `insertHash` as a path that requires you already know the exact `Bytes<32>` that was stored.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
