# Wallet submit print path hides the node reason

Upstream: [midnightntwrk/midnight-docs#1509](https://github.com/midnightntwrk/midnight-docs/issues/1509)

Related: [midnightntwrk/servicedesk#225](https://github.com/midnightntwrk/servicedesk/issues/225) and the closed runbook [servicedesk#238](https://github.com/midnightntwrk/servicedesk/issues/238).

Official how-to, read 2026-10-08: [Decode 1010 transaction rejection errors](https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors). It still shows `await api.tx.someCall().signAndSend(account)` and says `String(err)` includes the `data` value while `JSON.stringify(err)` prints `{}` and loses the code. Issue #1509 asks to swap that sample for the wallet submit call. This lab note does not change the public page.

Official node error codes, same day: [Transaction submission errors](https://docs.midnight.network/nodes/error-codes). That page starts wallet and SDK failures at `SubmissionError: Transaction submission error`.

#238 recorded the print difference on node 1.0.400. `WalletFacade.submitTransaction` rejects with `err.message` equal to `Transaction submission error`, `err.cause` undefined, and no `1010` in `err.stack` or `JSON.stringify(err)`. `String(err)` and `console.error(err)` still carry the node reason. midnight-js contract calls are the exception: the chain is already in `err.message`. #225 is the same wrap for the block-limit sentence.

`packages/preprod-hello-stub/src/submit-print-path.mjs` classifies those strings. It does not submit a transaction and does not fix the public Preprod node or indexer.

Check: `node src/submit-print-path.mjs` from `packages/preprod-hello-stub`.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
