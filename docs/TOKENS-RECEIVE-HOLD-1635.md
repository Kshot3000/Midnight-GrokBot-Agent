# How a Compact contract receives and holds tokens (midnight-docs#1635)

Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1635

Official sources only (no invented APIs):

- Tokens overview: https://docs.midnight.network/tokens/overview — names `receiveShielded` / `sendShielded` and the dual ledger; does not expand receive or custody.
- Standard library: https://docs.midnight.network/compact/standard-library/exports — `receiveUnshielded`, `receiveShielded`, `sendUnshielded`, `insertCoin` / `writeCoin` on Map/Set of QualifiedShieldedCoinInfo.
- Token-transfers example: https://docs.midnight.network/examples/contracts/token-transfers — `receiveUnshielded`, `receiveShielded`, `receiveNightTokens`.
- Private Party: https://docs.midnight.network/tutorials/private-party/smart-contract — `receiveUnshielded(nativeToken(), entryFee as Uint<128>)`; the caller's wallet supplies the funds when it balances the transaction.
- Private Tip Jar: https://docs.midnight.network/tutorials/private-tip-jar/smart-contract — fresh `ShieldedCoinInfo` + `receiveShielded` + `Map.insertCoin` so the contract can later `sendShielded`.

## What the Tokens pages omit (from the issue)

The Tokens pages cover mint and send. They do not explain:

1. How `receiveUnshielded` / `receiveShielded` work inside a circuit.
2. What the DApp must pass.
3. That the caller's wallet funds the receive when it balances the transaction.
4. How a contract stores a shielded coin with `insertCoin` (or `writeCoin`) so it can spend it later without the indexer.

## Documented patterns (Compact ~0.31.1 / language ~0.23)

### Unshielded receive (Private Party + token-transfers)

```compact
receiveUnshielded(nativeToken(), entryFee as Uint<128>);
// or
receiveUnshielded(color, disclose(amount));
```

- `receiveUnshielded` adds a validation condition that the given amount of that color is paid into the contract.
- The caller's wallet supplies those funds when it balances the transaction (Private Party docs).
- Unshielded transfers are public: sender, recipient, and amount are visible.
- NIGHT uses `nativeToken()` or `default<Bytes<32>>` depending on the example; amounts are in STAR (1 NIGHT = 1_000_000 STAR).

### Shielded receive + custody (Private Tip Jar)

```compact
export circuit tip(coin: ShieldedCoinInfo): [] {
  // guards...
  receiveShielded(disclose(coin));
  pot.insertCoin(
    disclose(coin.nonce),
    disclose(coin),
    right<ZswapCoinPublicKey, ContractAddress>(kernel.self())
  );
}
```

- `coin` is a *fresh* `ShieldedCoinInfo` (color, value, nonce), not one of the tipper's existing wallet coins.
- `receiveShielded` claims it for the contract: the transaction must contain a Zswap output creating that coin for the contract.
- The tipper's wallet pays for it from its own coins of that color and receives change under fresh nonces.
- `insertCoin` (available when the Map/Set value type is `QualifiedShieldedCoinInfo`) looks up the `mt_index` the ledger assigns in the same transaction and stores the qualified coin.
- Later `sendShielded` can spend that qualified coin. The indexer is not required for a coin received or minted in the same transaction.
- Publishing the coin is safe when the nonce is fresh (commitment is a hash of nonce/color/value/owner; a fresh nonce does not link to a wallet coin).

### Mint-to-self then hold

token-transfers shows `mintShieldedToken(..., right<ZswapCoinPublicKey, ContractAddress>(kernel.self()))`. The same `insertCoin` / `writeCoin` pattern from Tip Jar applies when the contract mints the coin itself in the same transaction.

## Lab artifacts

- `contracts/hello-midnight/receive-tokens-skeleton.compact` — language-pinned skeleton of the two receive patterns copied from the official examples. Source only; not compiled or deployed here.
- `packages/preprod-hello-stub/src/tokens-receive-hold-1635.mjs` — exports the cited URLs and a short checklist. LOCAL-TRUE. No network calls.

These notes do not edit upstream docs, do not invent APIs, and do not claim a fix of the public indexer or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
