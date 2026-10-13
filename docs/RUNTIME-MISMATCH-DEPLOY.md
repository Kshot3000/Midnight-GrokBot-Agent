# Opaque deploy failure when contract runtime differs from midnight-js

Upstream: [midnightntwrk/servicedesk#236](https://github.com/midnightntwrk/servicedesk/issues/236)

Official matrix: [Support matrix](https://docs.midnight.network/relnotes/support-matrix).  
Official how-to: [Fix version mismatches](https://docs.midnight.network/how-to/fix-version-mismatches).  
`checkRuntimeVersion`: [compact-runtime](https://docs.midnight.network/api-reference/compact-runtime/functions/checkRuntimeVersion).

When the contract was compiled for a different compact-runtime than midnight-js 4.1.1 expects (matrix: compiler 0.31.1 / compact-runtime 0.16.0), `createUnprovenDeployTx` / `deployContract` fails with an error that does not name the cause:

- `ContractConfigurationError: Failed to configure constructor context with coin public key` caused by `TypeError: Cannot read properties of undefined (reading 'coinPublicKey')`
- `Error: Unexpected error: Error: expected instance of ContractMaintenanceAuthority` (also from a second physical copy of `@midnight-ntwrk/onchain-runtime-v3`)

The generated contract calls `checkRuntimeVersion('0.19.0')` or `0.20.0` for newer compilers; midnight-js 4.1.1 loads 0.16.x. The lab decoder in `packages/preprod-hello-stub/src/runtime-mismatch-decode.mjs` maps those strings onto the support-matrix pins so a builder can recompile with Compact ~0.31.1 and install a single copy of onchain-runtime-v3 3.0.0.

It does not call `createUnprovenDeployTx`, does not invent Compact APIs, and does not claim to fix midnight-js or the public node.

```bash
cd packages/preprod-hello-stub
node src/runtime-mismatch-decode.mjs
# or the existing check script if present
```

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
