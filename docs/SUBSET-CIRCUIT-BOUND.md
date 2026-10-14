# Keep exported circuit count low for a single deploy transaction

Upstream: [midnightntwrk/servicedesk#226](https://github.com/midnightntwrk/servicedesk/issues/226)

Related: [midnightntwrk/servicedesk#225](https://github.com/midnightntwrk/servicedesk/issues/225) (RPC 1010 surfaces as a generic submission error)

Official: [Using Compact contracts from JavaScript](https://docs.midnight.network/guides/compact-javascript-runtime)

midnight-js 4.1.1 `deployContract` / `createUnprovenDeployTx` always include every exported circuit's verifier key. A deploy writes roughly 1.2× the verifier-key bytes. The per-block `bytesWritten` limit is 50_000 on mainnet, preprod, and preview. In practice a normal transaction is only included up to about 65% of that.

Contracts with roughly 15 or more exported circuits often cannot be deployed in one transaction. The ledger supports a subset-then-maintenance workaround, but that API is not exposed in midnight-js 4.1.1.

Lab sample: `contracts/hello-midnight/subset-circuit-bound.compact` exports only two circuits. The checker `packages/preprod-hello-stub/src/subset-circuit-bound.mjs` counts exported circuits and flags counts above a soft max of 12. It does not compile, prove, or submit, and does not claim a fix of the public midnight-js package, indexer, or node.

```bash
cd packages/preprod-hello-stub
node src/subset-circuit-bound.mjs
```

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
