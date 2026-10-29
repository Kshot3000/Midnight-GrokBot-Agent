# Merkle path leaf binding (midnight-docs#63)

Upstream issue: [midnightntwrk/midnight-docs#63](https://github.com/midnightntwrk/midnight-docs/issues/63)

Official references (do not invent APIs):

- https://docs.midnight.network/concepts/how-midnight-works/keeping-data-private
- https://docs.midnight.network/compact/reference/ledger-adt
- https://docs.midnight.network/guides/security-best-practices

## What the pages say

The private-data page shows the membership pattern:

```
export circuit check(item: Field): [] {
  const path = findItem(item);
  assert(path.leaf == item, "path is not for this item");
  assert(items.checkRoot(disclose(merkleTreePathRoot<10, Field>(path))), "path must be valid");
}
```

It notes that `findItem` is a witness, so without the `path.leaf == item` line any valid path in the tree would satisfy `checkRoot`.

The ledger ADT page distinguishes:

- `insert(item: value_type)` — inserts a new leaf at the first free index.
- `insertHash(hash: Bytes<32>)` — inserts a new leaf with a given hash at the first free index.

`pathForLeaf` and `findPathForLeaf` are TypeScript helpers on the generated ledger state objects. They are not Compact circuits.

## Lab pin

`contracts/hello-midnight/path-leaf-bind-63.compact` records the documented binding for the `insert` path on Compact language 0.23. It asserts `path.leaf == item` before `checkRoot`. It does not invent a transformation for `insertHash` and does not claim that a path built for a preimage will succeed after `insertHash`.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

LOCAL-TRUE. Source only. Does not call the public indexer or node. Does not claim those are fixed.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
