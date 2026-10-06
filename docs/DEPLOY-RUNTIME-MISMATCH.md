# Deploy errors that hide a compact-runtime mismatch

Upstream: [midnightntwrk/servicedesk#236](https://github.com/midnightntwrk/servicedesk/issues/236)

`createUnprovenDeployTx` / `deployContract` in midnight-js 4.1.1 can fail without naming the cause when the contract runtime differs from the SDK. Official docs tell builders to compare `npm list` output with the support matrix and recompile after aligning versions. They do not add a new deploy API for this case. This lab only names the two strings already reported upstream.

Observed messages:

1. `ContractConfigurationError: Failed to configure constructor context with coin public key`, caused by `TypeError: Cannot read properties of undefined (reading 'coinPublicKey')`. Upstream reproduced this with compiler 0.34.0 / 0.35.0 (`checkRuntimeVersion('0.19.0')` or `0.20.0`). The support matrix for midnight-js 4.1.1 lists Compact compiler 0.31.1 and compact-runtime 0.16.0.
2. `Error: expected instance of ContractMaintenanceAuthority` when the contract package has its own copy of `@midnight-ntwrk/onchain-runtime-v3`, even at the same version. The matrix on-chain runtime is 3.0.0. Install one copy.

`packages/preprod-hello-stub/src/runtime-mismatch-decode.mjs` maps those strings and a generated `checkRuntimeVersion('…')` pin onto the matrix. It does not call midnight-js deploy, does not submit a transaction, and does not claim a fix of the public indexer or node.

Official:

- https://docs.midnight.network/relnotes/support-matrix
- https://docs.midnight.network/how-to/fix-version-mismatches
- https://docs.midnight.network/api-reference/compact-runtime/functions/checkRuntimeVersion

Pins used by this lab: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Also read this run: servicedesk#235 (self-hosted node 1.0.300 genesis halt; public RPC users are not affected), servicedesk#225 (RPC 1010 wrapped as a generic submission error), midnight-docs#1494 (support-matrix JSON links), example-hello-world#41 (unused axios / testcontainers). None of those are fixed here.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
