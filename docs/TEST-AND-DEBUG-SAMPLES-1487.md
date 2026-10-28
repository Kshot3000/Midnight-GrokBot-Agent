# Test and debug page: code samples do not run as written on Compact 0.31.1 / runtime 0.16.0

Upstream: [midnightntwrk/midnight-docs#1487](https://github.com/midnightntwrk/midnight-docs/issues/1487)

Official pages (read 2026-10-27):

- https://docs.midnight.network/compact/test-and-debug
- https://docs.midnight.network/guides/compact-javascript-runtime
- https://docs.midnight.network/relnotes/support-matrix

The support matrix pairs Preview, Preprod, and Mainnet with Compact toolchain 0.31.1, Compact runtime 0.16.0, and Midnight.js 4.1.1. The test-and-debug page samples were checked against those versions and do not run as written.

Observed mismatches (from the upstream issue, confirmed against the live page and the JavaScript guide):

- Samples that call `contract.impureCircuits` pass a hand-built `{ privateState, ledgerState }` object. Generated code expects a `CircuitContext` (built with `createConstructorContext` / `createCircuitContext` from `@midnight-ntwrk/compact-runtime`). The call rejects with a type error before the circuit runs.
- Results are read as `newLedgerState` / `newContext`. A circuit call returns `result`, `context`, `proofData`, and `gasCost`. Ledger state is read via `ledger(result.context.currentQueryContext.state)` (see the JavaScript guide).
- Expected assert messages (`'Board is occupied'`, `'Board is vacant'`, `'Not authorized'`) do not match the bulletin board contract messages cited in the issue.
- On-chain snippets call `tx.wait()` and expect status `'APPLIED_TO_CHAIN'` / `receipt.found`. With midnight-js 4.1.1, `callTx` resolves with the finalized transaction; statuses are `SucceedEntirely`, `FailFallible`, and `FailEntirely`.
- The Compact sample uses top-level `const`, `Bytes<32>{}`, and a ledger write that needs `disclose()`.
- Links and samples still reference the retired Counter tutorial.

This lab note does not edit midnight-docs, does not invent Compact or midnight-js APIs, and does not claim a fix to the public indexer or node. It only records the mismatch so builders pinned to Compact ~0.31.1 / language ~0.23 and midnight-js 4.1.1 can follow the working patterns in the JavaScript guide instead of the test-and-debug samples.

Companion files in this repo (not a deploy):

- `contracts/hello-midnight/test-debug-sample-note.compact` — language pragma pin and a minimal circuit that compiles under the matrix.
- `packages/preprod-hello-stub/src/test-debug-sample-decode.mjs` — classifies pasted error strings that match the patterns above.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
