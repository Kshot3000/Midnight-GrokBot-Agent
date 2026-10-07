# Submission wrapper hides the node rejection

Upstream: [midnightntwrk/servicedesk#225](https://github.com/midnightntwrk/servicedesk/issues/225)

Related docs gap: [midnightntwrk/midnight-docs#1385](https://github.com/midnightntwrk/midnight-docs/issues/1385)

Official node error codes: https://docs.midnight.network/nodes/error-codes

Official 1010 decode: https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors

servicedesk#225 reports that node RPC `1010` with the text `Transaction would exhaust the block limits` reaches callers only as `Transaction submission error`. The node error codes page already describes that wrapping: the wallet SDK submission service uses `SubmissionError: Transaction submission error`, `FiberFailure.message` keeps only the outer text, and `String(error)` is required to see `Custom error: N`. `JSON.stringify` drops the node text.

The same page and the decode-1010 guide name these ledger variants (numbers can change between node releases):

| N | Variant on the decode-1010 page |
| --- | --- |
| 154 | BlockLimitExceededError |
| 155 | FeeCalculationError (replaces retired 168 FeeCalculation) |
| 138 | BalanceCheckOverspend |
| 108 | ReplayCounterMismatch |
| 193 | ReplayProtectionViolation |

`1010` without `Custom error: N` is a Substrate check (bad signature, stale era, or wrong nonce), not a ledger variant.

midnight-docs#1385 says the node error codes page still omits submission-layer code `10999`. This lab does not invent a variant name for that code.

`packages/preprod-hello-stub/src/submission-error-decode.mjs` classifies an error string a builder already has. It does not submit a transaction and does not claim the public node or indexer is fixed.

Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Also read this run: servicedesk#223 (preprod RPC head goes backwards), servicedesk#236 (deploy errors that hide a runtime mismatch), midnight-docs#1504 (preprod Blockfrost cutoff), example-hello-world#41 (unused axios / testcontainers). None of those are fixed here.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
