# Single-transaction deploy vs block limits

Upstream: [midnightntwrk/servicedesk#226](https://github.com/midnightntwrk/servicedesk/issues/226)

Related: [midnightntwrk/servicedesk#225](https://github.com/midnightntwrk/servicedesk/issues/225) (the node reason can be hidden as `Transaction submission error`).

Official decode page: https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors

A Midnight node can reject a transaction with JSON-RPC `1010` / `Invalid Transaction`. When the inner value is `Custom error: 154`, the documented variant is `BlockLimitExceededError`: the transaction would exceed the block resource limits. `Custom error: 232` is `FeeCalculation.BlockLimitExceeded`. The documented fix is to reduce the number of intents or calls, and to split batched work across transactions. Code `1010` with the text `Transaction would exhaust the block limits` and no `Custom error: N` is the Substrate envelope described in that same how-to, not a proof-server failure.

servicedesk#226 reports that midnight-js 4.1.1 `deployContract` / `createUnprovenDeployTx` always include every provable circuit, and that a contract with roughly 15 exported circuits can be too heavy for one deploy. That 15 is the reporter's observation, not a constant published by the node. This lab does not add a subset-deploy option and does not rewrite `ContractDeploy`.

`packages/preprod-hello-stub/src/deploy-circuit-budget.mjs` counts `export circuit` declarations in Compact source and warns at that observation. It does not compile the contract and does not claim the public indexer or node was fixed.

Pins for this lab: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
