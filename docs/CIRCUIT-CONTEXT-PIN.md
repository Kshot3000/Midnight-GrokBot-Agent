# Circuit context pin for Test and debug samples

Upstream: [midnightntwrk/midnight-docs#1487](https://github.com/midnightntwrk/midnight-docs/issues/1487)

Official: [Using Compact contracts from JavaScript](https://docs.midnight.network/guides/compact-javascript-runtime)

The Test and debug page still passes a hand-built `{ privateState, ledgerState }` object into `impureCircuits` and reads `newLedgerState` / `newContext`. The JavaScript runtime guide (compact-runtime 0.16.0) says a real `CircuitContext` is produced by `createConstructorContext` and `createCircuitContext`. A call returns `result`, `context`, `proofData`, and `gasCost`. State is read with `ledger(result.context.currentQueryContext.state)`.

This lab does not edit midnight-docs. `contracts/hello-midnight/circuit-context-pin.compact` is a language-pinned sample (`pragma language_version >= 0.23`) that uses `disclose` for a public ledger write. `packages/preprod-hello-stub/src/circuit-context-pin.mjs` only checks that source. It does not call the compiler, midnight-js, or a proof server, and it does not claim the public page is fixed.

Pins used by this lab: Compact ~0.31.1, language >= 0.23, compact-runtime 0.16.0, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Documented setup (do not hand-build the context):

```js
const ctor = contract.initialState(RT.createConstructorContext({ secretKey }, COIN));
const ctx = RT.createCircuitContext(ADDR, COIN, ctor.currentContractState, { secretKey });
const call = contract.impureCircuits.post(ctx, 'Hello from Compact!');
const board = ledger(call.context.currentQueryContext.state);
```

Assert text on that same guide, not the shorter strings on the test-and-debug page:

- `Attempted to post to an occupied board`
- `Attempted to take down post from an empty board`
- `Attempted to take down post, but not the current owner`

The Counter tutorial linked from the stale page was retired. Follow the bulletin-board suite on the JavaScript runtime guide.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
