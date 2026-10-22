# Block-limits 1010 decode (generic submission error)

Upstream: [midnightntwrk/servicedesk#225](https://github.com/midnightntwrk/servicedesk/issues/225)

Official:

- https://docs.midnight.network/api-reference/error-reference/
- https://docs.midnight.network/relnotes/support-matrix
- https://docs.midnight.network/guides/deploy-and-operate

servicedesk#225 reports that when the node rejects a transaction with RPC `1010 Invalid Transaction: Transaction would exhaust the block limits`, midnight-js 4.1.1 `submitTx` (via `@midnightntwrk/wallet-sdk-capabilities` ~3.3.1) rejects with a message that is only `Transaction submission error`. The node reason is not in `.message`, `.stack`, or the immediate `.cause`; it sits inside an Effect FiberFailure unwrapping chain.

A Preprod (or mainnet-limits) deploy of a contract with many exported circuits can hit this when `bytesWritten` approaches the per-transaction share of the block limit. The caller sees a generic failure and has no indication that the transaction is simply too heavy.

## Lab helper (LOCAL-TRUE)

`packages/preprod-hello-stub/src/block-limits-1010-decode.mjs` classifies:

- an outer generic "Transaction submission error" with no 1010 text,
- a nested cause chain that contains `1010` or "exhaust the block limits".

It does not call a node, does not submit a transaction, and does not invent APIs. Run:

```bash
node packages/preprod-hello-stub/src/block-limits-1010-decode.mjs
```

This lab does not claim a fix of the public indexer, node, or wallet SDK. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
