# Tokens: how a Compact contract receives and holds tokens

**Upstream issue:** [midnightntwrk/midnight-docs#1635](https://github.com/midnightntwrk/midnight-docs/issues/1635)  
Tokens pages: explain how a contract receives and holds tokens.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.  
Official docs only: https://docs.midnight.network/. Do not invent APIs.

This lab note summarizes the official patterns so builders can find them without piecing tutorials together. It does **not** claim to fix the public docs, indexer, or node.

## Unshielded receive (e.g. NIGHT)

From [Private Party smart contract](https://docs.midnight.network/tutorials/private-party/smart-contract) and [Token transfers example](https://docs.midnight.network/examples/contracts/token-transfers):

```compact
receiveUnshielded(nativeToken(), entryFee as Uint<128>);
```

- `receiveUnshielded(color, amount)` adds a validation that the given amount of that color is paid into the contract.
- The caller's wallet supplies the funds when it balances the transaction.
- Unshielded transfers are public (sender, recipient, amount visible).
- `nativeToken()` is NIGHT. Units are STAR (1 NIGHT = 1_000_000 STAR).
- To check balance: `unshieldedBalance` / `unshieldedBalanceGte`.
- To send out: `sendUnshielded(color, amount, recipient)` where recipient is `Either<ContractAddress, UserAddress>`.

See also [Compact standard library exports](https://docs.midnight.network/compact/standard-library/exports).

## Shielded receive and hold

From [Private Tip Jar smart contract](https://docs.midnight.network/tutorials/private-tip-jar/smart-contract):

```compact
receiveShielded(disclose(coin));
pot.insertCoin(
  disclose(coin.nonce),
  disclose(coin),
  right<ZswapCoinPublicKey, ContractAddress>(kernel.self())
);
```

Key points (official):

- The `coin: ShieldedCoinInfo` the caller passes is a **fresh** coin description, not one of the tipper's existing wallet coins. The wallet creates the corresponding Zswap output and pays from its coins (making change).
- `receiveShielded` claims that coin for this contract.
- `insertCoin` (on a Map or Set whose value type is `QualifiedShieldedCoinInfo`) looks up the Merkle tree index allocated in **this** transaction and stores the qualified coin so the contract can later spend it with `sendShielded`.
- This works only for coins created in the same transaction. For coins from earlier transactions the index typically comes from the indexer.
- `writeCoin` is the alternative mentioned in ledger ADT docs for the same purpose.
- Fresh coins (same tx) use `sendImmediateShielded`; committed coins use `sendShielded` (needs `mt_index`).

See [Ledger ADT reference](https://docs.midnight.network/compact/reference/ledger-adt) for `insertCoin` / `writeCoin` signatures and [Shielded token tutorial](https://docs.midnight.network/tokens/shielded-token) for mint-and-send patterns (`mintShieldedToken` + `sendImmediateShielded`).

## Lab skeleton

See `contracts/hello-midnight/receive-hold-tokens.compact` for a minimal, non-deployed example using only the official primitives above.

## Related official pages

- https://docs.midnight.network/tokens/overview
- https://docs.midnight.network/tokens/shielded-token
- https://docs.midnight.network/tokens/unshielded-token
- https://docs.midnight.network/examples/contracts/token-transfers
- https://docs.midnight.network/tutorials/private-party/smart-contract
- https://docs.midnight.network/tutorials/private-tip-jar/smart-contract

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
