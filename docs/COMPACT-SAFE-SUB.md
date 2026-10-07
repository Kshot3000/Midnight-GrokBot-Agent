# Compact subtraction does not wrap

Upstream: [midnightntwrk/midnight-docs#1387](https://github.com/midnightntwrk/midnight-docs/issues/1387)

Compact reference pages are copied from LFDT-Minokawa/compact, so a docs-site edit would be overwritten. The arithmetic failure mode is already stated on the security guide and is easy to miss when a circuit subtracts a `Uint` without a bound assert.

Official source (do not invent a wrapping API): https://docs.midnight.network/guides/security-best-practices

- `a - b` where `b > a` aborts at runtime with `result of subtraction would be negative`.
- Assert the bound first so the failure carries a domain message. The documented message is `insufficient balance`.
- Disclose the amount before the public ledger write. `disclose()` does not publish by itself.
- Addition widens, so a same-width store needs a bound assert and a cast such as `(a + b) as Uint<64>`. This lab file only copies the documented subtraction pair.

Lab contract: `contracts/hello-midnight/safe-sub.compact`

- `constructor` sets `balance = 5`, matching the official sample.
- `unsafeSub` subtracts `disclose(amount)` with no prior assert.
- `safeSub` discloses, asserts `amt <= balance`, then subtracts.

`packages/preprod-hello-stub/src/safe-sub-invariant.mjs` is a source check only. It does not compile Compact, does not call proof-server 8.1.0, and does not claim a Preprod deploy. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This lab note does not fix the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
