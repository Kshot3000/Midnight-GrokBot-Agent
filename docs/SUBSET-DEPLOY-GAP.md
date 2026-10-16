# Subset deploy and multi-insert verifier-key gap

Upstream: [midnightntwrk/servicedesk#226](https://github.com/midnightntwrk/servicedesk/issues/226)

Official: [deployContract](https://docs.midnight.network/api-reference/midnight-js/@midnight-ntwrk/midnight-js-contracts/functions/deployContract) (midnight-js 4.1.1)

`deployContract` creates and submits a contract deployment transaction. The published signature has no option to deploy a subset of circuits. The open servicedesk issue states that contracts with roughly 15 or more exported circuits cannot be deployed with `deployContract` because every circuit's verifier key goes into the single deploy transaction. A deploy writes about 1.2× its verifier-key bytes. The per-block `bytesWritten` limit is 50,000 on mainnet, preprod and preview. In practice a normal transaction is only included up to about 65% of that.

The ledger already supports deploying a subset then adding remaining verifier keys with CMA-signed `MaintenanceUpdate`s. midnight-js 4.1.1 exposes only a single-key `submitInsertVerifierKeyTx`. The issue requests a subset option on `deployContract` / `createUnprovenDeployTx` and a multi-insert maintenance API. This lab does not invent those APIs, does not patch midnight-js, and does not claim to fix the public indexer or node.

Lab sample: `contracts/hello-midnight/subset-deploy-note.compact` exports two ledger-touching circuits. Two is a visible count, not a protocol cap. `packages/preprod-hello-stub/src/subset-deploy-decode.mjs` classifies a pasted message that mentions `bytesWritten` or verifier-key size so a Preprod path can point at the official `deployContract` page and the upstream issue instead of treating it as an unknown failure.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Official docs only: https://docs.midnight.network/. Source check only. Not compiled in this change. Not deployed.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
