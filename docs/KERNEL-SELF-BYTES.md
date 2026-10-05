# kernel.self().bytes is a ContractAddress field

Upstream: [midnightntwrk/midnight-docs#1387](https://github.com/midnightntwrk/midnight-docs/issues/1387)

Kapa traffic asked whether `kernel.self().bytes` exists. Official ledger ADT docs say `kernel.self()` returns `ContractAddress`. The standard library defines that as `struct ContractAddress { bytes: Bytes<32>; }`. The Compact reference shows `kernel.self()` after `import CompactStandardLibrary`. Field access `.bytes` is on the returned struct. `kernel.bytes()` is not a Kernel operation.

The same issue asked how many leaves one Merkle call can insert. `MerkleTree.insert(item)` inserts one leaf at the first free index. `insertIndex` is the documented index form. This lab does not invent a multi-leaf insert.

The Compact reference also says an `emit` in the constructor is a static error. `contracts/hello-midnight/kernel-self.compact` has no constructor and no `emit`.

`packages/preprod-hello-stub/src/kernel-self-invariant.mjs` is a source check only. It does not compile Compact, does not call the proof server, and does not claim a Preprod deploy. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This lab note does not fix the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
