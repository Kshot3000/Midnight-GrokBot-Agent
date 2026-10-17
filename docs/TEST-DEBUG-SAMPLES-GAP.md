# Test-and-debug page samples do not run as written

Upstream: [midnightntwrk/midnight-docs#1487](https://github.com/midnightntwrk/midnight-docs/issues/1487)

Official page: https://docs.midnight.network/compact/test-and-debug

The open issue reports that samples on the test-and-debug page do not type-check or run against the versions in the compatibility matrix (Compact toolchain 0.31.1, Compact runtime 0.16.0, Midnight.js 4.1.1).

Observed mismatches (from the issue, not invented):

- Direct calls on `contract.impureCircuits` pass a `{ privateState, ledgerState }` object. Generated code expects `CircuitContext`.
- Result fields: callers expect `newLedgerState` / `newContext`; actual return is `result`, `context`, `proofData`, `gasCost`.
- Bulletin-board assert messages do not match the strings in the samples.
- On-chain snippets call `tx.wait()` after `callTx`, which already resolves with the finalized transaction. Status strings and `receipt.found` do not match.
- Compact sample uses top-level `const`, `Bytes<32>{}`, and a ledger write without `disclose()`.
- Link to the retired Counter tutorial.

This lab does not edit the public docs site. It only records the gap and points builders to the working pattern on [Using Compact contracts from JavaScript](https://docs.midnight.network/guides/compact-javascript-runtime), which builds context with `createConstructorContext` / `createCircuitContext` and reads state via `ledger(result.context.currentQueryContext.state)`.

Pins used here: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Do not invent APIs. This does not claim a fix of the public docs, indexer, or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
