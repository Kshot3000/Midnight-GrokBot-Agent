# Opaque deploy construction errors hide runtime skew

Upstream: [midnightntwrk/servicedesk#236](https://github.com/midnightntwrk/servicedesk/issues/236)

Official version mismatches: https://docs.midnight.network/how-to/fix-version-mismatches

Official support matrix: https://docs.midnight.network/relnotes/support-matrix

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, compact-runtime 0.16.x, proof-server 8.1.0.

## Reported shapes

When the contract's runtime differs from midnight-js's, `createUnprovenDeployTx` / `deployContract` fails without naming the cause:

1. `ContractConfigurationError: Failed to configure constructor context with coin public key` caused by `TypeError: Cannot read properties of undefined (reading 'coinPublicKey')` — typically a contract compiled for a newer runtime (0.19 / 0.20) against midnight-js 4.1.1.

2. `Error: Unexpected error: Error: expected instance of ContractMaintenanceAuthority` — typically two physical copies of `@midnight-ntwrk/onchain-runtime-v3`.

## Lab decoder

`packages/preprod-hello-stub/src/runtime-mismatch-decode.mjs` classifies these two strings. It does not deploy, does not call a node, indexer, proof server, or wallet, and does not invent APIs.

```js
import { decodeRuntimeMismatch } from './runtime-mismatch-decode.mjs';

const result = decodeRuntimeMismatch(err);
// result.kind === 'coinPublicKey-undefined' or 'maintenance-authority'
```

## What this does not do

This does not patch midnight-js. It does not fix the public indexer or node. It only helps a builder map the opaque message back to the support-matrix pin.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
