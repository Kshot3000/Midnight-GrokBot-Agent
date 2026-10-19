# MalformedContractDeploy (Custom error 174) on deploy path

Upstream: [midnightntwrk/servicedesk#257](https://github.com/midnightntwrk/servicedesk/issues/257)

Official error table: https://docs.midnight.network/nodes/error-codes

Official deploy path: https://docs.midnight.network/guides/deploy-and-operate

Code 174 is `MalformedContractDeploy` in the node error-codes table (node 1.0.x). The description is "Contract deployment is structurally invalid". The how-to-fix note is "Check for non-zero balance or incorrect charged state in deploy".

servicedesk#257 reports valid deploys that pass `TaggedTransactionQueue_validate_transaction` (Valid) and `BlockBuilder_apply_extrinsic` (Ok) yet stay pending until TTL on mainnet public RPCs, while calls land. That is a different failure mode from a 174 rejection. This lab note keeps the two separate so a builder who pastes a 1010 / Custom error: 174 can tell a structural deploy rejection from the pending-until-TTL symptom.

This lab does not submit a transaction, does not invent a filter flag API, and does not claim the public indexer or node is fixed. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Lab files:

- `packages/preprod-hello-stub/src/malformed-deploy-174-decode.mjs` — classifies pasted error text. Matches Custom error 174 or the name MalformedContractDeploy and returns a structured note pointing at the official table and #257. No network calls.
- `contracts/hello-midnight/malformed-deploy-note.compact` — Compact note only. No circuit. Points builders at the off-chain classifier.

Workaround when you see 174: rebuild the deploy with the pinned midnight-js 4.1.1 and Compact 0.31.1 pair from the support matrix, confirm the charged state matches the official deployContract / submitDeployTx path, and do not treat a pending pool entry as a 174. Pending-until-TTL with Valid validate is the #257 report.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
