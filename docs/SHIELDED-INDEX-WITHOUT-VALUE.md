# Shielded Merkle index without persisting coin value

Upstream: https://github.com/midnightntwrk/servicedesk/issues/213

Official types: https://docs.midnight.network/compact/standard-library/exports

`QualifiedShieldedCoinInfo` is `nonce`, `color`, `value`, and `mtIndex`. Official ledger ADT docs say `Cell.writeCoin(coin, recipient)` writes a `ShieldedCoinInfo` and the runtime fills `mtIndex` on a `QualifiedShieldedCoinInfo` cell: https://docs.midnight.network/compact/data-types/ledger-adt

That cell includes `value`. `receiveShielded(coin: ShieldedCoinInfo): []` does not return the allocated index. There is no documented `writeCoin` that targets a bare `Uint`.

Lab source `contracts/hello-midnight/coin-index-gap.compact` stores `persistentCommit` of the receipt opening in `Bytes<32>` and does not call `writeCoin` or `insertCoin`. `persistentCommit` is documented as protecting its input when `rand` is random, so the commitment may cross `disclose()` into the public ledger. The coin value is not the ledger cell.

This does not add a Compact API, does not deploy, and does not claim the public indexer or node was fixed. Language pin: Compact ~0.31.1 / language 0.23. midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
