# callTx finalization sample still waits on a resolved call

Upstream: [midnightntwrk/midnight-docs#1487](https://github.com/midnightntwrk/midnight-docs/issues/1487)

The open docs issue says the samples on https://docs.midnight.network/compact/test-and-debug do not run as written against Compact toolchain 0.31.1, Compact runtime 0.16.0, and Midnight.js 4.1.1. One of those samples (and the next-steps bullet) calls `tx.wait()` after `deployedContract.callTx.increment()` / `post`, then expects `receipt.status` of `APPLIED_TO_CHAIN` and `receipt.found`.

Official midnight-js pages, read 2026-10-07:

- `submitCallTx` returns `Promise<FinalizedCallTxData>`. The call already resolves with the finalized transaction. https://docs.midnight.network/api-reference/midnight-js/@midnight-ntwrk/midnight-js-contracts/functions/submitCallTx
- `submitCallTxAsync` returns after submission. The documented follow-up is `providers.publicDataProvider.watchForTxData(txId)`, then a compare against `SucceedEntirely`. https://docs.midnight.network/api-reference/midnight-js/@midnight-ntwrk/midnight-js-contracts/functions/submitCallTxAsync
- `TxStatus` is `FailEntirely | FailFallible | SucceedEntirely`. https://docs.midnight.network/api-reference/midnight-js/@midnight-ntwrk/midnight-js-types/type-aliases/TxStatus
- `SucceedEntirely` means the guaranteed and fallible portions succeeded. https://docs.midnight.network/api-reference/midnight-js/@midnight-ntwrk/midnight-js-types/variables/SucceedEntirely

`APPLIED_TO_CHAIN` and `receipt.found` are not on those pages. This lab does not patch midnight-docs and does not fix the public indexer or node.

The Compact sample on the same page also fails to compile (`const` at top level, an empty `Bytes` constructor, a ledger write that needs `disclose()`). `contracts/hello-midnight/calltx-finalization.compact` is a language 0.23 counterpart with a counter increment and no empty `Bytes` literal. It is not deployed.

`packages/preprod-hello-stub/src/calltx-finalization-decode.mjs` classifies a pasted snippet. `npm test` in that package covers it. Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
