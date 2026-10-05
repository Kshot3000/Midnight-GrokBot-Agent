# Preprod "Transaction submission error (code: 10999)" is not a ledger u8

Upstream: [midnightntwrk/midnight-docs#1385](https://github.com/midnightntwrk/midnight-docs/issues/1385)

Kapa traffic on Preprod asks what `Transaction submission error (code: 10999)` means. The official node error page lists `LedgerApiError` codes as `u8` values (0–255) and says a Substrate `1010` envelope carries `Custom error: N`: https://docs.midnight.network/nodes/error-codes

The how-to page says the same thing: `1010` is the Substrate envelope, and the actionable signal is the inner `u8`. https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors

Neither page names `10999`. Issue #1385 asks the docs to add a submission-layer section and to confirm the list with the node team rather than documenting only codes seen in the wild. This lab does not invent a variant name for `10999`.

`packages/preprod-hello-stub/src/rpc-errors.mjs` now treats a five-digit `(code: N)` as a submission-layer code, not as `Custom error: N`. It points at #1385 and the official tables. It also names documented variants builders already hit:

- `155` `FeeCalculationError` (how-to page)
- `231` `FeeCalculation.OutsideTimeToDismiss` (how-to malformed table; open report [servicedesk#117](https://github.com/midnightntwrk/servicedesk/issues/117))
- `103` `Zswap` (error-codes page)

This does not fix the public Preprod node, indexer, or midnight-docs. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
