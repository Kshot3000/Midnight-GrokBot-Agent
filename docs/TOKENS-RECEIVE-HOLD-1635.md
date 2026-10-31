# How a Compact contract receives and holds tokens (midnight-docs#1635)

Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1635

Official sources only (no invented APIs):

- https://docs.midnight.network/tokens/overview (mentions receiveShielded / sendShielded without detailing custody)
- https://docs.midnight.network/tokens/unshielded-token
- https://docs.midnight.network/tokens/shielded-token
- https://docs.midnight.network/examples/contracts/token-transfers
- https://docs.midnight.network/tutorials/private-party/smart-contract (receiveUnshielded for entry fee)
- https://docs.midnight.network/tutorials/private-tip-jar/smart-contract (receiveShielded + insertCoin for custody)
- https://docs.midnight.network/compact/standard-library/exports (receiveUnshielded, receiveShielded, insertCoin, mint*, send*)
- https://docs.midnight.network/compact/reference/ledger-adt (insertCoin on Map/Set of QualifiedShieldedCoinInfo)

## Unshielded receive (NIGHT or custom)

`receiveUnshielded(color: Bytes<32>, amount: Uint<128>)` adds a validation condition that the transaction must supply the given amount of that token color to the contract. The caller's wallet funds it when balancing the transaction (see Private Party entry-fee path).

After the call, the contract's unshielded balance for that color increases; later circuits read it with `unshieldedBalance` / `unshieldedBalanceGte` and spend with `sendUnshielded`.

Native NIGHT uses `nativeToken()` or `default<Bytes<32>>` as the color. Custom colors come from `tokenType(domain, kernel.self())`.

## Shielded receive and hold

`receiveShielded(coin: ShieldedCoinInfo)` claims a fresh (same-transaction) coin addressed to the contract. The DApp constructs the coin; the caller's wallet creates the corresponding Zswap output when balancing.

To hold it for a later spend, store the qualified form:

```compact
export ledger pot: Map<Bytes<32>, QualifiedShieldedCoinInfo>;

export circuit tip(coin: ShieldedCoinInfo): [] {
  receiveShielded(disclose(coin));
  pot.insertCoin(
    disclose(coin.nonce),
    disclose(coin),
    right<ZswapCoinPublicKey, ContractAddress>(kernel.self())
  );
}
```

`insertCoin` looks up the Merkle index allocated in the current transaction and stores a `QualifiedShieldedCoinInfo`. A later circuit can spend that entry with `sendShielded` (see Private Tip Jar).

`writeCoin` is the Set analogue (same docs). Fresh coins can also be spent immediately with `sendImmediateShielded` without storage (shielded-token tutorial).

Committed coins from earlier transactions require the DApp to supply a `QualifiedShieldedCoinInfo` that already has `mt_index` (typically from the indexer).

These notes do not edit upstream docs, do not invent APIs, and do not claim a fix of the public indexer or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
