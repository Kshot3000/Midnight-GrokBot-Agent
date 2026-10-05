# Test-and-debug samples do not run as written

Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1487

The open docs issue says the Test and debug page code samples do not run as written. This lab note only classifies those published snippets against the Compact JavaScript runtime guide. It does not patch midnight-docs, the public indexer, or the node.

## What the pages say

Broken samples (still live): https://docs.midnight.network/compact/test-and-debug

- Circuit tests pass a hand-built object `{ privateState, ledgerState }` into `impureCircuits.increment` / `post` / `takeDown`.
- They read `result.newLedgerState` and `result.newContext`.
- The boundary example contains `const= contract.impureCircuits.increment(...)` with no binding name.
- The finalization example calls `tx.wait()` and expects `receipt.status === 'APPLIED_TO_CHAIN'`.
- Negative tests expect `'Board is vacant'` and `'Not authorized'`.

Working shape: https://docs.midnight.network/guides/compact-javascript-runtime

- Build the context with `createConstructorContext` and `createCircuitContext`. A hand-built object fails the wrapper check for `currentQueryContext` (`type error: ... expected value of type CircuitContext`).
- An impure call returns `CircuitResults`: `result`, `context`, `proofData`, `gasCost`. Ledger reads go through `ledger(call.context.currentQueryContext.state)`.
- The same guide quotes the bulletin-board rejection as `Attempted to take down post, but not the current owner`, not `Not authorized`.

This lab does not invent a replacement for `tx.wait` or `APPLIED_TO_CHAIN`. Those names are not on the runtime guide.

## Lab check

`packages/preprod-hello-stub/src/test-debug-sample.mjs` flags the published sample shapes. `npm test` in that package covers it. LOCAL-TRUE. No deploy is claimed.

Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
