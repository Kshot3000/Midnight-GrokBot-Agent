# midnight-js deploy fails without naming a runtime mismatch

Upstream: [midnightntwrk/servicedesk#236](https://github.com/midnightntwrk/servicedesk/issues/236)

Official: [Fix version mismatch errors](https://docs.midnight.network/how-to/fix-version-mismatches) and the [compatibility matrix](https://docs.midnight.network/relnotes/support-matrix).

When a contract's Compact runtime (or a second physical copy of `@midnight-ntwrk/onchain-runtime-v3`) differs from the midnight-js 4.1.1 pin, `createUnprovenDeployTx` / `deployContract` fails with opaque messages:

- `TypeError: Cannot read properties of undefined (reading 'coinPublicKey')` (ContractConfigurationError wrapping it)
- `Error: expected instance of ContractMaintenanceAuthority`

Neither message names the version skew. The lab decoder in `packages/preprod-hello-stub/src/runtime-mismatch-decode.mjs` matches those shapes and points builders at the support-matrix versions (Compact ~0.31.1 / compact-runtime 0.16.x for midnight-js 4.1.1). It does not call a node, indexer, proof server, or wallet, and does not claim to fix the public SDK.

```bash
cd packages/preprod-hello-stub
node src/runtime-mismatch-decode.mjs
npm run check:runtime-mismatch
```

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
