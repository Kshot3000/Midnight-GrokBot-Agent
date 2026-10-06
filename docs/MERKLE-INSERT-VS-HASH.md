# MerkleTree.insert vs insertHash

Upstream: [midnightntwrk/midnight-docs#63](https://github.com/midnightntwrk/midnight-docs/issues/63)

Related: [midnightntwrk/midnight-docs#1387](https://github.com/midnightntwrk/midnight-docs/issues/1387) (Kapa could not answer how many leaves one `insert` updates, or whether leaves can differ in size).

Official ledger ADT: https://docs.midnight.network/compact/reference/ledger-adt

That page documents `MerkleTree<nat, value_type>` with depth `2 <= nat <= 32`. The methods this lab uses, and only these:

- `insert(item: value_type): []` inserts one new leaf at the first free index.
- `insertHash(hash: Bytes<32>): []` inserts one new leaf that is already a hash, at the first free index.
- `isFull(): Boolean` reports that further direct inserts cannot proceed.

A second argument is not part of either signature. Leaves in one tree share `value_type`; this lab does not claim a mixed-size leaf API. The private-data guide shows the same one-leaf shape: `items.insert(disclose(item))` on `MerkleTree<10, Field>` (https://docs.midnight.network/concepts/how-midnight-works/keeping-data-private).

`insert` is the call when the circuit still has the leaf. `insertHash` is the call when the circuit already has a `Bytes<32>` hash. This note does not add an indexer or node behavior.

Lab contract: `contracts/hello-midnight/merkle-insert.compact`

- `insertLeaf` asserts `!items.isFull()` then `items.insert(disclose(item))`.
- `insertPrehashed` asserts `!items.isFull()` then `items.insertHash(disclose(hash))`.
- Language pin `>= 0.23`, compiler about `0.31.1`. Source check only. Not compiled here. Not deployed.

`packages/preprod-hello-stub/src/merkle-insert-invariant.mjs` flags a missing pin, a two-argument insert, a hash passed to `insert`, and a direct insert that skips `isFull`. `npm test` in that package covers it. LOCAL-TRUE.

Pins used here: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
