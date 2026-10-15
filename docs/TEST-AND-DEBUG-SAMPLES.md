# Test and Debug Page Samples Do Not Run

Upstream issue:

- [midnightntwrk/midnight-docs#1487](https://github.com/midnightntwrk/midnight-docs/issues/1487) — Test and debug page: code samples don't run as written (for mn-codeowners-compact).

Official page (checked 2026-10-14):

- https://docs.midnight.network/compact/test-and-debug

Pinned surfaces this lab targets: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

## What breaks

Samples that call `contract.impureCircuits` pass a hand-built `{ privateState, ledgerState }` object. The generated code rejects it with a type error expecting `CircuitContext`. Result fields `newLedgerState` and `newContext` do not exist; a call returns `result`, `context`, `proofData`, and `gasCost`.

Expected assert strings do not match the bulletin board contract ("Board is occupied" vs the actual message). On-chain snippets call `tx.wait()` after `callTx` (which already resolves with the finalized transaction) and look for a status of `'APPLIED_TO_CHAIN'`.

The Compact sample itself does not compile under the pinned language (top-level `const`, empty `Bytes<32>{}`, ledger write without `disclose()`).

## Correct pattern (official)

Use the working examples on the official guide:

https://docs.midnight.network/guides/compact-javascript-runtime

That page shows:

- Build genesis state with `contract.initialState(RT.createConstructorContext({ secretKey }, COIN))`.
- Build the circuit context with `RT.createCircuitContext(ADDR, COIN, ctor.currentContractState, { secretKey })`.
- Call `contract.impureCircuits.post(ctx, message)`.
- Read state with `ledger(call.context.currentQueryContext.state)`.

Assert messages must match the Compact source exactly (for the bulletin board: "Attempted to post to an occupied board", "Attempted to take down post from an empty board", "Attempted to take down post, but not the current owner").

## Lab note

This document does not claim any change to the public docs, indexer, or node. It only records the mismatch for builders pinned to the versions above and points at the official working surface.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
