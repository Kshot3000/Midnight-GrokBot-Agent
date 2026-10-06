# Language floor versus the hidden deploy version mismatch

Upstream: [midnightntwrk/servicedesk#236](https://github.com/midnightntwrk/servicedesk/issues/236)

Official compiler troubleshooting documents this sentence when a compiled contract runs against a different `@midnight-ntwrk/compact-runtime`:

`version mismatch: compiled code expects X.Y.Z, runtime is A.B.C`

Source: https://docs.midnight.network/troubleshoot/compiler-errors

The same page shows the language floor this lab uses:

```
pragma language_version >= 0.23;
```

Issue 236 records a different path. A one-circuit contract with `pragma language_version >= 0.20` compiled by 0.34.0 or 0.35.0 (`checkRuntimeVersion('0.19.0')` or `0.20.0`) makes midnight-js 4.1.1 `createUnprovenDeployTx` / `deployContract` fail without that sentence. The observed strings are `Cannot read properties of undefined (reading 'coinPublicKey')` and `expected instance of ContractMaintenanceAuthority`. The support matrix pairing for this lab is Compact toolchain 0.31.1, compact-runtime 0.16.0, Midnight.js 4.1.1: https://docs.midnight.network/relnotes/support-matrix

`contracts/hello-midnight/matrix-language-pin.compact` keeps the 0.23 floor. `packages/preprod-hello-stub/src/matrix-language-pin.mjs` flags a lower floor and classifies either the official sentence or the opaque deploy-construction shape. It does not compile Compact, does not call midnight-js, and does not claim a fix of the public indexer or node.

Also read this run: servicedesk#235 (self-hosted node 1.0.300 genesis halt; public RPC users are not affected), servicedesk#230 (1AM preprod indexer tip lag), midnight-docs#1494 (support-matrix JSON links), example-hello-world#41 (unused axios / testcontainers). None of those are fixed here.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
