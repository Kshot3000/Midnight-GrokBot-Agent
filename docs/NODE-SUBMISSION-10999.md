# Node submission-layer codes (including 10999) and code-less invalid

Upstream:
- [midnightntwrk/midnight-docs#1385](https://github.com/midnightntwrk/midnight-docs/issues/1385) (error-codes page missing submission-layer codes users hit, e.g. 10999)
- [midnightntwrk/midnight-docs#1509](https://github.com/midnightntwrk/midnight-docs/issues/1509) (code-less `TransactionInvalidError`)

Official reference: [Node error codes](https://docs.midnight.network/nodes/error-codes).

The published tables list `LedgerApiError` values that surface as Substrate `InvalidTransaction::Custom(u8)`. Submission-layer wrappers and the code-less case where the node drops the transaction at block build time are thinner. A reproduced cause of the code-less form is two wallet instances on one seed spending the same DUST while the first transaction is still pending.

This lab decoder (`packages/preprod-hello-stub/src/node-submission-10999-decode.mjs`) classifies those messages so a caller can attach a hint. It does not contact a node, does not invent API surfaces, and does not claim a fix of the public indexer or node.

```bash
cd packages/preprod-hello-stub
node src/node-submission-10999-decode.mjs
```

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
