# Receiving and holding tokens in a Compact contract

Upstream issue: [midnightntwrk/midnight-docs#1635](https://github.com/midnightntwrk/midnight-docs/issues/1635)

Official sources only (no invented APIs):

- [Tokens overview](https://docs.midnight.network/tokens/overview)
- [Token transfers example](https://docs.midnight.network/examples/contracts/token-transfers)
- [Private tip jar smart contract](https://docs.midnight.network/tutorials/private-tip-jar/smart-contract)
- [Private party smart contract](https://docs.midnight.network/tutorials/private-party/smart-contract)
- [Compact standard library exports](https://docs.midnight.network/compact/standard-library/exports)

Issue #1635 notes that Tokens pages cover mint and send but do not explain how a contract receives a payment or holds a shielded coin for later spend. The patterns already exist in the tutorials and the token-transfers example.

## Unshielded receive

`receiveUnshielded(color, amount)` adds a validation that the transaction supplies the given unshielded amount of that color to this contract. The caller's wallet funds it when balancing the transaction. Examples:

- Custom color: `tokenType(domain, kernel.self())` then `receiveUnshielded(color, disclose(amount))` (token-transfers).
- Native NIGHT: `receiveUnshielded(nativeToken(), disclose(amount))` or `default<Bytes<32>>` (private-party and token-transfers).

The amount and color are public (unshielded). `disclose()` is required when the value comes from an argument or witness that reaches the call.

## Shielded receive and hold

`receiveShielded(coin)` claims a `ShieldedCoinInfo`. The client typically constructs a *fresh* coin (new nonce); the wallet creates the matching Zswap output and pays from its coins of that color when balancing. Change returns under fresh nonces.

To hold the coin so the contract can spend it later, store a `QualifiedShieldedCoinInfo` with `insertCoin` (or `writeCoin`). `insertCoin` fills the `mt_index` from the commitment tree for a coin created in the same transaction:

```
pot.insertCoin(
  disclose(coin.nonce),
  disclose(coin),
  right<ZswapCoinPublicKey, ContractAddress>(kernel.self())
);
```

(See private-tip-jar.) The pot key (nonce) is public; use a fresh nonce so it does not link to a wallet coin. Later `sendShielded` can spend the stored qualified coin.

## Lab pin

See `contracts/hello-midnight/receive-tokens.compact` for a source-only Compact pin of the documented forms. LOCAL-TRUE. Not compiled or deployed here. This lab does not claim a fix of the public indexer, node, or official docs.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
