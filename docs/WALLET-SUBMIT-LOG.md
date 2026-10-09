# 1010 how-to still samples polkadot.js signAndSend

Upstream: [midnightntwrk/midnight-docs#1509](https://github.com/midnightntwrk/midnight-docs/issues/1509)

Official how-to (checked 2026-10-09): [Decode 1010 transaction rejection errors](https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors). The JavaScript example still calls `await api.tx.someCall().signAndSend(account)`. Midnight DApps do not submit that way. The same page says `String(err)` keeps the error text and `JSON.stringify(err)` prints `{}`.

#1509 asks to swap that sample for the wallet SDK call with the same `String(err)` logging. The official Wallet SDK reference already uses `wallet.submitTransaction(tx)` after `finalizeRecipe` ([Wallet SDK](https://docs.midnight.network/api-reference/wallet-sdk)). This lab helper only classifies a source string the caller already has and returns that replacement. It does not call a wallet, submit a transaction, or change the public docs page.

```js
try {
  await wallet.submitTransaction(tx);
} catch (err) {
  console.error(String(err));
}
```

Check: `node src/wallet-submit-log.mjs` from `packages/preprod-hello-stub`.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
