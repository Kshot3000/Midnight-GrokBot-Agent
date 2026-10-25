# Prove path for the lab hello contract on Preprod

Upstream: [midnightntwrk/midnight-docs#1383](https://github.com/midnightntwrk/midnight-docs/issues/1383)

Official:

- https://docs.midnight.network/guides/local-proving
- https://docs.midnight.network/guides/run-proof-server
- https://docs.midnight.network/getting-started/hello-world

Issue #1383 asks for a clear statement of proving topology (local proof server vs wallet-delegated vs hosted). The official local-proving page states that the proof server must run locally (or on a machine you control) because it receives witness data, and that it listens on port 6300 by default. The proof server is not a Blockfrost service.

For this lab's hello contract the compile output lives at `contracts/hello-midnight/out`. The midnight-js providers expect:

- contract module: `out/contract/index.js`
- proving keys: `out/keys/`
- ZKIR: `out/zkir/`

`packages/preprod-hello-stub/src/paths.mjs` resolves `HELLO_OUT` to that directory and `HELLO_CONTRACT` to the module. `call-preprod.mjs` builds `CompiledContract.withCompiledFileAssets(..., HELLO_OUT)` so the prove call uses the local keys. This is a local path fix only; it does not change the public proof server, indexer, or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
