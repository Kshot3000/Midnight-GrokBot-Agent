# Transfer sample on Test and debug does not compile

Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1487

The open docs issue says the Compact sample on the Test and debug page does not compile against the compatibility-matrix pin. This lab note only classifies that sample. It does not patch midnight-docs, the public indexer, or the node.

## What the page still shows

Stale sample: https://docs.midnight.network/compact/test-and-debug

The "Comprehensive validation example" is the Compact block, not the JavaScript unit tests already classified in `docs/TEST-DEBUG-SAMPLE-GAP.md`:

- `const MAX_AMOUNT` and `const MIN_AMOUNT` sit at the top level.
- The recipient check uses `Bytes<32>{}`.
- `balance = balance - amount` writes a circuit parameter with no `disclose()`.

Issue #1487 names those three as the reasons the sample does not compile.

## Documented shape this lab follows

https://docs.midnight.network/getting-started/hello-world says circuit parameters are private and a ledger write needs `disclose()`. https://docs.midnight.network/compact/smart-contract-security says `assert` is the bounds check. This lab does not invent a zero `Bytes<32>` literal to replace `Bytes<32>{}`.

`contracts/hello-midnight/transfer-bounds.compact` keeps the numeric bounds inside the circuit and discloses both ledger writes. `packages/preprod-hello-stub/src/transfer-bounds-invariant.mjs` flags the published shape. LOCAL-TRUE. No deploy is claimed.

Pins stay Compact ~0.31.1 / language >= 0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
