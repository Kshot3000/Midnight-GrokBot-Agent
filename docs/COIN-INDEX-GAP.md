# Capture a shielded-coin Merkle index without storing the full coin

Upstream: [midnightntwrk/servicedesk#213](https://github.com/midnightntwrk/servicedesk/issues/213)

Official:

- https://docs.midnight.network/compact/data-types/ledger-adt — Cell.writeCoin / Set.insertCoin / Map.insertCoin require a `QualifiedShieldedCoinInfo` cell, so the coin value is part of the public ledger entry. The runtime fills `mtIndex` only when the index was allocated in the current transaction.
- https://docs.midnight.network/compact/standard-library/exports — `QualifiedShieldedCoinInfo` includes nonce, color, value, and mtIndex. `persistentCommit` (with a random `rand`) is a recognized safe commitment; its opening may be disclosed.
- https://docs.midnight.network/guides/security-best-practices — a value becomes visible only when it crosses a public boundary (ledger write, exported-circuit return, or contract-to-contract call).

Issue #213 asks for a way to capture an allocated shielded-coin Merkle index without persisting the full coin (and its value) on-chain. Official ledger ADTs do not offer a separate “index-only” cell. `writeCoin` / `insertCoin` always store `QualifiedShieldedCoinInfo`, which includes the value.

The lab sample `contracts/hello-midnight/coin-index-gap.compact` therefore does **not** call `writeCoin`. It builds a `persistentCommit` opening of nonce, color, and a hash of the value, then stores only the disclosed opening in a `Bytes<32>` cell. It does not invent an API that returns `mtIndex`, does not compile or deploy, and does not claim a fix of the public indexer or node.

Local classifier: `packages/preprod-hello-stub/src/coin-index-gap.mjs` (`npm run check:coin-index-gap`). It classifies a ledger cell type as “publishes-value” for `QualifiedShieldedCoinInfo` and “commitment-only” for `Bytes<32>`. LOCAL-TRUE.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
