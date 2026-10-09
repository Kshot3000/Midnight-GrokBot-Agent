# createCircuitContext arity: 0.16.0 guide vs 0.19.0 API reference

Upstream: [midnightntwrk/midnight-docs#1487](https://github.com/midnightntwrk/midnight-docs/issues/1487)

Official guide for the lab pin (compact-runtime 0.16.0, midnight-js 4.1.1):

https://docs.midnight.network/guides/compact-javascript-runtime

```js
const ctx = RT.createCircuitContext(ADDR, COIN, ctor.currentContractState, { secretKey });
const call = contract.impureCircuits.post(ctx, 'Hello from Compact!');
```

Published API reference, which issue #1487 says is already at compact-runtime 0.19.0:

https://docs.midnight.network/api-reference/compact-runtime/functions/createCircuitContext

That signature takes `circuitId` first, then contract address, coin or zswap state, contract state, and private state. The same issue says circuit calls on that reference return promises. Copying it into a 0.16.0 / midnight-js 4.1.1 project does not match the guide.

This lab does not edit midnight-docs and does not claim the public page is fixed. `packages/preprod-hello-stub/src/runtime-context-arity.mjs` classifies a pasted sample only. It does not call the compiler, midnight-js, or a proof server.

Pins: Compact ~0.31.1 / language >= 0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Also read this run, not fixed here: servicedesk#236 (deploy errors that hide a runtime mismatch), servicedesk#225 (RPC 1010 wrapped as a generic submission error), example-hello-world#41 (unused axios / testcontainers). This note does not fix the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
