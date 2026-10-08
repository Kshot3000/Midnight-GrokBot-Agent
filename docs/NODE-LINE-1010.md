# Node 1.0.x Custom error 168 is not retired

Lab note for [midnight-docs#1509](https://github.com/midnightntwrk/midnight-docs/issues/1509).

The official [node error codes](https://docs.midnight.network/nodes/error-codes) page says its tables are the codes node version 1.0.x returns. That page lists `168` as `FeeCalculation` ("Transaction size or timing parameters are invalid") next to `155` `FeeCalculationError`. It also lists `182` `TransactionApplicationError` (intent TTL), `193` `ReplayProtectionViolation`, and `196` `DustDoubleSpend`.

The official [decode 1010](https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors) page still pairs `168 FeeCalculation / 155 FeeCalculationError` and still samples `api.tx.someCall().signAndSend(account)`. Issue 1509 says Midnight transactions are the unsigned `send_mn_transaction` call, checked in `validate_unsigned`, so a 1010 with no inner u8 is not a bad signature, stale era, or wrong nonce. The same issue says the tables were checked against node 1.0.400. Preprod, preview, and mainnet builders should look up `N` on the 1.0.x page, not treat 168 as retired.

`packages/preprod-hello-stub/src/node-line-1010.mjs` classifies that published subset. `classifySubmitPrint` separates a wallet SDK failure (code only in `String(err)`) from a midnight-js contract call (code in `err.message`). It does not submit a transaction.

This note does not change the public docs page, the public node, or the public indexer.

```js
import { classifyNodeLine1010 } from './node-line-1010.mjs';
classifyNodeLine1010(168);
```

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
