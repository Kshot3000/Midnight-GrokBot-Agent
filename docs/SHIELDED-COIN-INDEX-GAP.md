# Shielded-coin Merkle index without writing the full coin

Upstream: [midnightntwrk/servicedesk#213](https://github.com/midnightntwrk/servicedesk/issues/213)

Official ledger ADT page (Cell.writeCoin):
- https://docs.midnight.network/compact/data-types/ledger-adt

`writeCoin` (and the Set/Map/List variants) accepts a `ShieldedCoinInfo` and the runtime fills `mtIndex` to produce a `QualifiedShieldedCoinInfo`. The cell type must be `QualifiedShieldedCoinInfo`, so the coin value becomes part of the public ledger cell. `receiveShielded` does not return the allocated index.

Issue #213 asks for a way to capture the allocated Merkle index without persisting the full coin (and its value) on-chain. The comment on the issue points at MIP-0012 for related custody work. This lab does not invent an API, does not implement a new Compact primitive, and does not claim the public indexer or node was fixed.

Lab sample `contracts/hello-midnight/coin-index-gap.compact` records a `persistentCommit` of the nonce, color, and hashed value (with a random opening) into a `Bytes<32>` cell, then increments a counter. The value itself is not written to the ledger. Source only; not compiled or deployed here.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This does not claim a fix of the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
