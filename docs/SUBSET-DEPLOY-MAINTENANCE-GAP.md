# Subset deploy and multi-insert verifier-key gap

Upstream: [midnightntwrk/servicedesk#226](https://github.com/midnightntwrk/servicedesk/issues/226)

midnight-js 4.1.1 `deployContract` / `createUnprovenDeployTx` always include every provable circuit. A deploy writes about 1.2× its verifier-key bytes. The per-block `bytesWritten` limit is 50,000 on mainnet, preprod and preview. In practice a normal transaction is only included up to about 65% of that. Contracts with roughly 15 or more exported circuits therefore cannot be deployed in one transaction.

The ledger already supports a workaround: deploy a subset of operations, then add the remaining verifier keys with CMA-signed `MaintenanceUpdate`s. Official docs describe the maintenance path:

- https://docs.midnight.network/guides/making-decision-on-contract-updatability
- https://docs.midnight.network/guides/updatability
- https://docs.midnight.network/guides/deploy-and-operate
- https://docs.midnight.network/api-reference/midnight-js/@midnight-ntwrk/midnight-js-contracts/functions/submitInsertVerifierKeyTx
- https://docs.midnight.network/api-reference/ledger/classes/MaintenanceUpdate
- https://docs.midnight.network/api-reference/ledger/type-aliases/SingleUpdate

`submitInsertVerifierKeyTx` inserts **one** key per transaction. The ledger type `MaintenanceUpdate` accepts an array of `SingleUpdate` (`VerifierKeyInsert` | `VerifierKeyRemove` | `ReplaceAuthority`). midnight-js 4.1.1 does not expose a multi-insert helper. Builders who need a batched deploy today must rewrite the unproven `ContractDeploy` by hand (as noted in the upstream issue) and later call the single-insert API, or construct the ledger `MaintenanceUpdate` themselves.

This lab does not invent a `deployContract` subset option, a multi-insert API, or a batched deploy helper. It only names the gap and points at the official single-insert and maintenance types.

`packages/preprod-hello-stub/src/subset-deploy-gap.mjs` exports the upstream URL, the official single-insert signature, and a pure function that flags a circuit count above the practical one-tx threshold reported upstream. It does not call midnight-js, does not submit a transaction, and does not claim a fix of the public indexer or node.

Pins used by this lab: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Also read this run: servicedesk#236 (opaque deploy errors on runtime mismatch), servicedesk#225 (RPC 1010 wrapped as generic submission error), midnight-docs#1509 (1010 decode gaps), example-hello-world#41 (unused axios / testcontainers). None of those are fixed here.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
