# Deploy errors that hide a runtime mismatch

Upstream: [midnightntwrk/servicedesk#236](https://github.com/midnightntwrk/servicedesk/issues/236)

`createUnprovenDeployTx` / `deployContract` in midnight-js 4.1.1 can fail without naming the cause when the contract runtime is not the SDK runtime. This lab only classifies the two strings recorded on that issue. It does not change midnight-js, and it does not fix the public indexer or node.

Recorded failures:

1. `ContractConfigurationError: Failed to configure constructor context with coin public key`, caused by `TypeError: Cannot read properties of undefined (reading 'coinPublicKey')`. Issue 236 records this for a contract built by compiler 0.34.0 or 0.35.0 (runtime 0.19.0 / 0.20.0) loaded next to midnight-js 4.1.1.
2. `Error: expected instance of ContractMaintenanceAuthority` when the contract package has its own `@midnight-ntwrk/onchain-runtime-v3`, even at the same version.

Support matrix pairing used by this lab (https://docs.midnight.network/relnotes/support-matrix): Compact toolchain 0.31.1, compact-runtime 0.16.0, on-chain runtime 3.0.0, Midnight.js 4.1.1. Version-mismatch how-to: https://docs.midnight.network/how-to/fix-version-mismatches.

`packages/preprod-hello-stub/src/runtime-mismatch.mjs` maps those two strings to that pairing. Other submit errors stay on `rpc-errors.mjs`.

Pins used by this lab: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
