# Corrected transfer sample from Test and debug page (midnight-docs#1487)

Upstream issue: [midnightntwrk/midnight-docs#1487](https://github.com/midnightntwrk/midnight-docs/issues/1487)

Official docs only:

- https://docs.midnight.network/compact/test-and-debug — the page with the sample that does not compile
- https://docs.midnight.network/compact/reference/writing — language rules, disclose, no top-level const
- https://docs.midnight.network/compact/reference/explicit-disclosure
- https://docs.midnight.network/guides/compact-javascript-runtime — correct circuit-context and call shape for unit tests

midnight-docs#1487 reports that the Compact sample on the Test and debug page does not compile under Compact toolchain 0.31.1 / language ~0.23. The sample uses a top-level `const`, an empty `Bytes<32>{}` literal, and a ledger write of a circuit argument without `disclose()`.

This lab note records a source-only correction. It does not edit midnight-docs, claim a public indexer or node fix, or invent APIs. Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

## Problems in the published sample

- Top-level `const MAX_AMOUNT` / `MIN_AMOUNT` is not valid Compact. Constants belong inside a circuit or are expressed with other language forms.
- `Bytes<32>{}` is not a valid empty constructor. Use `pad(32, "")` or a non-empty literal when an empty check is required.
- Writing a circuit argument (or any potentially private value) to a ledger field requires an explicit `disclose()`.

## Lab pin

See `contracts/hello-midnight/transfer-bounds-sample.compact` for a language 0.23 source-only version of the bounds-checked transfer that follows the official writing and disclosure rules. LOCAL-TRUE. Not compiled or deployed here.

The same issue also notes that the page's JavaScript unit-test samples hand-build a `{ privateState, ledgerState }` context and expect `newLedgerState` / `newContext`. The JavaScript runtime guide documents the correct helpers (`createConstructorContext`, `createCircuitContext`) and the return shape (`result`, `context`, `proofData`, `gasCost`). Read ledger state with `ledger(call.context.currentQueryContext.state)`.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
