# CircuitContext type-error decoder

Upstream: [midnightntwrk/midnight-docs#1487](https://github.com/midnightntwrk/midnight-docs/issues/1487)

Official: [Using Compact contracts from JavaScript](https://docs.midnight.network/guides/compact-javascript-runtime)

The Test and debug page still shows hand-built `{ privateState, ledgerState }` objects passed to `impureCircuits`. Generated wrappers reject them before the circuit runs with a runtime type error of the form:

```
type error: <who> <what> at <where>; expected value of type CircuitContext but received <value>
```

The JavaScript runtime guide documents this exact case and the fix: build the context with `createConstructorContext` and `createCircuitContext`, then read state from `call.context.currentQueryContext.state`. A call returns `result`, `context`, `proofData`, and `gasCost`.

This lab does not edit midnight-docs and does not claim the public page is fixed. `packages/preprod-hello-stub/src/circuit-context-type-error-decode.mjs` classifies the message so a Preprod path can point at the official setup instead of treating it as an unknown CompactError.

Pins: Compact ~0.31.1, language >= 0.23, compact-runtime 0.16.0, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Official docs only: https://docs.midnight.network/.

Documented setup:

```js
const ctor = contract.initialState(RT.createConstructorContext({ secretKey }, COIN));
const ctx = RT.createCircuitContext(ADDR, COIN, ctor.currentContractState, { secretKey });
const call = contract.impureCircuits.post(ctx, 'Hello from Compact!');
const board = ledger(call.context.currentQueryContext.state);
```

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
