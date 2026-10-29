# Test and debug page: code samples do not run as written (midnight-docs#1487)

Upstream issue: [midnightntwrk/midnight-docs#1487](https://github.com/midnightntwrk/midnight-docs/issues/1487)

Official docs (do not invent APIs):

- https://docs.midnight.network/compact/test-and-debug
- https://docs.midnight.network/guides/compact-javascript-runtime
- https://docs.midnight.network/relnotes/support-matrix
- https://docs.midnight.network/api-reference/compact-runtime/

## Reported problems on Compact toolchain 0.31.1 / runtime 0.16.0 / midnight-js 4.1.1

The test-and-debug page samples were checked against the support matrix pins and do not run as written:

- Hand-built context objects `{ privateState, ledgerState }` are rejected. Generated code expects a real `CircuitContext`. Use the runtime helpers instead.
- Result shape is wrong. A circuit call returns `{ result, context, proofData, gasCost }`. There is no `newLedgerState` or `newContext`.
- Expected assert messages do not match the bulletin board contract (e.g. `'Board is occupied'` vs the actual contract strings).
- On-chain snippets call `tx.wait()` and expect `'APPLIED_TO_CHAIN'` / `receipt.found`. `callTx` already resolves with the finalized transaction; statuses are `SucceedEntirely`, `FailFallible`, `FailEntirely`.
- Compact sample uses top-level `const`, `Bytes<32>{}`, and a ledger write that needs `disclose()`.
- Counter tutorial is retired (redirects to bulletin board); samples still reference it.
- Next-steps link text is outdated.

## Correct pattern (from the official JavaScript runtime guide)

The guide at https://docs.midnight.network/guides/compact-javascript-runtime pins its samples to Compact toolchain 0.31.1 (language 0.23) and `@midnight-ntwrk/compact-runtime` 0.16.0 and shows the working approach:

```typescript
import * as RT from '@midnight-ntwrk/compact-runtime';
// ...
const ctor = contract.initialState(RT.createConstructorContext(privateState, coinPublicKey), ...ctorArgs);
const ctx = RT.createCircuitContext(contractAddress, coinPublicKey, ctor.currentContractState, privateState);
const call = contract.impureCircuits.someCircuit(ctx, ...args);
// call.result, call.context, call.proofData, call.gasCost
const ledgerView = ledger(call.context.currentQueryContext.state);
```

Hand-built objects fail validation because a real `CircuitContext` carries query-context state.

## Lab pin

This note cites the upstream issue and points to the official working guide. It does not edit midnight-docs, does not invent APIs, and does not claim a fix of the public docs site, indexer, or node.

See also `contracts/hello-midnight/circuit-context-pin.compact` for a related Compact source pin.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
