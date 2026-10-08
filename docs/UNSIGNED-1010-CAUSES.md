# Unsigned 1010 causes

Lab note for [midnight-docs#1509](https://github.com/midnightntwrk/midnight-docs/issues/1509).

The official page [Decode 1010 transaction rejection errors](https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors) still says that a `1010` with no `Custom error: N` is usually a bad signature, a stale era, or a wrong nonce. Issue 1509 says those checks are on signed extrinsics. Midnight transactions are submitted as the unsigned `send_mn_transaction` call and checked in `validate_unsigned`, so there is no signer, nonce, or era to get wrong.

The 1010 without a number that builders hit is `Transaction would exhaust the block limits` ([servicedesk#225](https://github.com/midnightntwrk/servicedesk/issues/225)). Do not map that sentence to ledger codes 154 or 232, and do not rebuild the transaction for a nonce or era.

The same how-to sample still calls `api.tx.someCall().signAndSend(account)`. Midnight DApps do not submit that way. Log `String(err)` from the wallet submit path. `JSON.stringify(err)` still drops the code, as the official page already says.

`packages/preprod-hello-stub/src/submission-error-decode.mjs` used to repeat the signed-extrinsic hint for a bare 1010, and `String({ code, message, data })` became `[object Object]`. It now walks `code`, `message`, and `data`, and classifies a no-u8 1010 with `classifyUnsigned1010`. A raw body whose `data` is `Transaction would exhaust the block limits` is `block-limit-no-u8`. A bare `1010: Invalid Transaction` is `unsigned-1010-no-inner-u8`. Neither path applies bad signature, stale era, or wrong nonce. This still does not submit a transaction.

This note does not change the public docs page, the public node, or the public indexer.

```js
import { classifyUnsigned1010 } from './unsigned-1010-causes.mjs';
classifyUnsigned1010('1010: Invalid Transaction: Transaction would exhaust the block limits');
```

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
