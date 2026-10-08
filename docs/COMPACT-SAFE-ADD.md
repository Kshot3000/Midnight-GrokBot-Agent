# Compact addition widens past the operand width

Upstream: [midnightntwrk/midnight-docs#1387](https://github.com/midnightntwrk/midnight-docs/issues/1387)

Compact reference pages are copied from LFDT-Minokawa/compact, so a docs-site edit would be overwritten. The arithmetic table on the security guide already says addition widens, and the earlier lab note only copied the subtraction pair.

Official source (do not invent a wrapping API): https://docs.midnight.network/guides/security-best-practices

- `a + b` has a result type wider than the operand width, so it cannot be assigned back to a same-width field.
- Assert bounds, then narrow with the documented cast `(a + b) as Uint<64>`, or store the sum in a wider field.
- This lab file uses only the cast form. The bound `amt <= 100` and the message `amount too large` are a lab stand-in. The official table does not publish an addition sample.
- Disclose the amount before the public ledger write. `disclose()` does not publish by itself.

Lab contract: `contracts/hello-midnight/safe-add.compact`

- `constructor` sets `balance = 5`, matching the subtraction sample on the same page.
- `safeAdd` discloses `amount`, asserts the lab bound, then stores `(balance + amt) as Uint<64>`.

`packages/preprod-hello-stub/src/safe-add-invariant.mjs` is a source check only. It does not compile Compact, does not call proof-server 8.1.0, and does not claim a Preprod deploy. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This lab note does not fix the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
