# Test-and-debug page samples do not match the pinned runtime

Upstream: [midnightntwrk/midnight-docs#1487](https://github.com/midnightntwrk/midnight-docs/issues/1487)

Official:

- https://docs.midnight.network/compact/test-and-debug
- https://docs.midnight.network/guides/compact-javascript-runtime
- https://docs.midnight.network/relnotes/support-matrix

Issue #1487 (opened 2026-10-03) reports that samples on the Test and debug page do not run as written against Compact toolchain 0.31.1, Compact runtime 0.16.0, and Midnight.js 4.1.1.

Observed mismatches (from the issue and the live page):

- Hand-built `{ privateState, ledgerState }` objects are passed to `impureCircuits.*`. The generated code expects a `CircuitContext` built with `createConstructorContext` / `createCircuitContext` from `@midnight-ntwrk/compact-runtime`.
- Results are read as `newLedgerState` / `newContext`. A call returns `result`, `context`, `proofData`, and `gasCost`. Ledger state is read with the generated `ledger()` helper on `context.currentQueryContext.state`.
- On-chain snippets call `tx.wait()` and expect status `'APPLIED_TO_CHAIN'` and a `receipt.found` field. `callTx` already resolves with the finalized transaction; statuses are `SucceedEntirely`, `FailFallible`, and `FailEntirely`.
- Compact sample uses top-level `const`, `Bytes<32>{}`, and a ledger write that may need disclosure handling. These are rejected or incorrect on language ~0.23.
- Assert messages in the samples (`'Board is occupied'`, `'Board is vacant'`, `'Not authorized'`) do not match the actual bulletin-board contract messages.
- Link to the retired Counter tutorial.

The Compact JavaScript runtime guide (https://docs.midnight.network/guides/compact-javascript-runtime) shows the working pattern for the same runtime: construct contexts with the runtime helpers, call through `impureCircuits`, and decode state with `ledger()`.

Lab sample (not compiled here):

- `contracts/hello-midnight/transfer-bounds.compact` — bounds and empty-recipient asserts that avoid the rejected top-level const and `Bytes<32>{}` forms.

This lab note does not invent APIs and does not claim a fix of the public docs site, indexer, or node. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
