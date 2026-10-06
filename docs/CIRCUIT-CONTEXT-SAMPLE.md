# Circuit context samples vs Compact runtime 0.16.0

Upstream: [midnightntwrk/midnight-docs#1487](https://github.com/midnightntwrk/midnight-docs/issues/1487)

Official: [Using Compact contracts from JavaScript](https://docs.midnight.network/guides/compact-javascript-runtime)

The [Test and debug](https://docs.midnight.network/compact/test-and-debug) page still shows unit tests that pass a hand-built `{ privateState, ledgerState }` object into `impureCircuits` and then read `newLedgerState` / `newContext`. The JavaScript runtime guide says a real `CircuitContext` carries query-context state that the wrappers check for, so hand-built objects fail validation. A call returns `result`, `context`, `proofData`, and `gasCost`.

This lab does not edit midnight-docs. `packages/preprod-hello-stub/src/circuit-context-sample.mjs` only flags a local sample so a builder can tell the stale shape from the documented one. It does not call the compiler, midnight-js, or a proof server, and it does not claim the public page is fixed.

Pins used by this lab: Compact ~0.31.1, language >= 0.23, compact-runtime 0.16.0 (`checkRuntimeVersion('0.16.0')` on generated output), midnight-js 4.1.1.

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
