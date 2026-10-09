# Test-and-debug samples do not run as written

Upstream: [midnightntwrk/midnight-docs#1487](https://github.com/midnightntwrk/midnight-docs/issues/1487)

The open docs issue says the Test and debug page code samples do not run as written. This lab note only classifies those published snippets against the Compact JavaScript runtime guide and the hello-world tutorial. It does not patch midnight-docs, the public indexer, or the node.

## What the pages say

Broken samples (still live): https://docs.midnight.network/compact/test-and-debug

- Circuit tests pass a hand-built object `{ privateState, ledgerState }` into `impureCircuits.increment` / `post` / `takeDown`.
- They read `result.newLedgerState` and `result.newContext`.
- The boundary example contains `const= contract.impureCircuits.increment(...)` with no binding name.
- The finalization example calls `tx.wait()` and expects `receipt.status === 'APPLIED_TO_CHAIN'`.
- Negative tests expect `'Board is vacant'` and `'Not authorized'`.
- The `transfer` circuit has no `pragma language_version 0.23;` and writes the private circuit argument `amount` to public ledger `balance` without `disclose(amount)`.

Working shape: https://docs.midnight.network/guides/compact-javascript-runtime

- Build the context with `createConstructorContext` and `createCircuitContext`. A hand-built object fails the wrapper check for `currentQueryContext` (`type error: ... expected value of type CircuitContext`).
- An impure call returns `CircuitResults`: `result`, `context`, `proofData`, `gasCost`. Ledger reads go through `ledger(call.context.currentQueryContext.state)`.
- The same guide quotes the bulletin-board rejection as `Attempted to take down post, but not the current owner`, not `Not authorized`.

Hello-world shape: https://docs.midnight.network/getting-started/hello-world

- `pragma language_version 0.23;` comes before ledger and circuit declarations.
- A private circuit parameter cannot be stored in public ledger state without `disclose`.

This lab does not invent a replacement for `tx.wait` or `APPLIED_TO_CHAIN`. Those names are not on the runtime guide.

## Lab check

`packages/preprod-hello-stub/src/test-debug-sample.mjs` flags the published sample shapes. `packages/preprod-hello-stub/src/debug-sample-gap.mjs` flags the missing pragma and the undisclosed `amount` write. `contracts/hello-midnight/debug-sample-disclose.compact` is the bounds sample with both. `npm run check:debug-sample` covers the pragma scan. Neither scanner compiles Compact, calls proof-server 8.1.0, or claims a public deploy.

Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Also read this run: servicedesk#236 (opaque deploy when the runtime is not the matrix pin), servicedesk#225 (RPC 1010 wrapped as a generic submission error), servicedesk#230 (Preprod indexer lag; not fixed here), midnight-docs#1509 (unsigned 1010 causes and code-less TransactionInvalidError), midnight-docs#1504 (Preprod Blockfrost cutoff), example-hello-world#41 (unused axios / testcontainers). None of those are fixed here.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
