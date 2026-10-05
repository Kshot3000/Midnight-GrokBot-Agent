# Decode Preprod RPC 1010 Custom error: N

Upstream: [midnightntwrk/servicedesk#225](https://github.com/midnightntwrk/servicedesk/issues/225)

Official source: [Node error codes](https://docs.midnight.network/nodes/error-codes). The documented node shape is:

```json
{ "code": 1010, "message": "Invalid Transaction", "data": "Custom error: 196" }
```

midnight-js 4.1.1 `submitTx` can still surface only `Transaction submission error`, with `.cause` undefined, because the wallet SDK wraps the RpcError in an Effect FiberFailure. This lab walks symbol-keyed causes and, when the collected text contains `Custom error: N`, names N only if that code is copied from the official table.

Copied names used by the stub (not a full table, and not a node fix):

| N | Documented name |
| --- | --- |
| 106 | VerifierKeyNotFound |
| 111 | TransactionTooLarge |
| 115 | InvalidProof |
| 126 | Unbalanced |
| 154 | BlockLimitExceededError |
| 166 | InvalidNetworkId |
| 174 | MalformedContractDeploy |
| 179 | UnsupportedProofVersion |
| 196 | DustDoubleSpend |

Codes above 255 are not ledger u8 values. Issue #225's bare `Transaction would exhaust the block limits` string is the Substrate check that omits `Custom error: N`; ledger code 154 is the documented block-limit code when the inner u8 is present. Related: [#226](https://github.com/midnightntwrk/servicedesk/issues/226) (subset deploy). This does not claim a fix of the public indexer or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
