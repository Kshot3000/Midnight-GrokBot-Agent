# Code-less TransactionInvalidError is not a signed-extrinsic 1010

Upstream: [midnightntwrk/midnight-docs#1509](https://github.com/midnightntwrk/midnight-docs/issues/1509)

Official how-to (checked 2026-10-08): [Decode 1010 transaction rejection errors](https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors). The "When 1010 has no inner u8" section still lists bad signature, stale era, and wrong nonce. Those are checks on signed extrinsics. Midnight transactions go in as the unsigned `send_mn_transaction` call, so there is no signer, nonce, or era to get wrong. This lab note does not change the public docs.

The 1010 without a number that builders hit is `1010: Invalid Transaction: Transaction would exhaust the block limits` ([servicedesk#225](https://github.com/midnightntwrk/servicedesk/issues/225)). Do not map that sentence onto `Custom error: 154` or `232`.

A rejection with no code at all is also missing from the how-to. After pool validation, a drop at block build reaches the client as:

```text
(FiberFailure) SubmissionError: Transaction submission error
  [cause]: TransactionInvalidError: Transaction is invalid and was rejected by the node
```

#1509 reproduced that with two wallet instances on one seed spending the same DUST while the first transaction was still pending. The node log said `DustDoubleSpend`; nothing with a code reached the client. After the first transaction was in a block, the same spend came back as `Custom error: 196`. Official node error codes name 196 `DustDoubleSpend` ([error codes](https://docs.midnight.network/nodes/error-codes)). The client fix is one wallet instance per seed, then rebuild. This decoder only classifies strings the caller already has. It does not fix the public Preprod node or indexer.

Check: `node src/code-less-invalid.mjs` from `packages/preprod-hello-stub`.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
