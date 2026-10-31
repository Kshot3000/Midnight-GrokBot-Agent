# Contract receive and hold tokens (lab note)

Upstream: [midnightntwrk/midnight-docs#1635](https://github.com/midnightntwrk/midnight-docs/issues/1635)

Official sources only (no invented APIs):

- [Tokens overview](https://docs.midnight.network/tokens/overview)
- [Create and transfer an unshielded token](https://docs.midnight.network/tokens/unshielded-token)
- [Create and transfer a shielded token](https://docs.midnight.network/tokens/shielded-token)
- [Token transfers example](https://docs.midnight.network/examples/contracts/token-transfers)
- [Private tip jar smart contract](https://docs.midnight.network/tutorials/private-tip-jar/smart-contract)
- [Private party smart contract](https://docs.midnight.network/tutorials/private-party/smart-contract)
- [Compact standard library exports](https://docs.midnight.network/compact/standard-library/exports)
- [Ledger ADTs (insertCoin)](https://docs.midnight.network/compact/reference/ledger-adt)

## Documented receive patterns

### Unshielded

`receiveUnshielded(color: Bytes<32>, amount: Uint<128>): []` receives the given amount of the unshielded token identified by the color. The caller's wallet supplies the funds when it balances the transaction (Private Party tutorial).

For native NIGHT: `receiveUnshielded(default<Bytes<32>>, disclose(amount))` or `receiveUnshielded(nativeToken(), ...)`.

For a contract-minted color: compute with `tokenType(domain, kernel.self())` then receive.

The Tokens overview names `receiveShielded` / `receiveUnshielded` but the main Tokens pages focus on mint/send; the receive path is shown in the token-transfers example and Private Party tutorial.

### Shielded

`receiveShielded(coin: ShieldedCoinInfo): []` receives a shielded coin, adding a validation condition requiring this coin to be present as an output addressed to this contract, and not received by another call.

To hold it for later spend, the Private Tip Jar stores it with `insertCoin` on a `Map<..., QualifiedShieldedCoinInfo>` (or Set). `insertCoin` transforms the `ShieldedCoinInfo` into a `QualifiedShieldedCoinInfo` by looking up the Merkle tree index allocated in the current transaction. That only works for a coin created in the same transaction.

Fresh coins (same transaction) are spent with `sendImmediateShielded`; committed coins (with `mt_index`) use `sendShielded`.

The shielded token tutorial mints and sends to the caller in one transaction with `sendImmediateShielded` to avoid tracking across transactions. The Go further section covers committed transfers.

## What the Tokens pages currently lack

As noted in the upstream issue, the Tokens pages cover mint and send but do not explain receive + hold, and do not link the Private Party (unshielded receive) or Private Tip Jar (shielded receive + `insertCoin`) tutorials. This lab note collects the documented patterns without claiming to update the public docs.

See `contracts/hello-midnight/receive-hold-tokens.compact` and `packages/preprod-hello-stub/src/tokens-receive-hold-note.mjs`.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
