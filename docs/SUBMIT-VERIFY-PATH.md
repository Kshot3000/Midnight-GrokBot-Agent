# Verify path still uses author_submitExtrinsic

Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1509

Official how-to (checked 2026-10-08): https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors

The page's "Capture the full RPC response" sample still calls polkadot.js `api.tx.someCall().signAndSend(account)`. Its "Verify the fix" sample still posts `author_submitExtrinsic` to `http://localhost:9944`. midnight-docs#1509 says Midnight DApps do not submit that way. The same issue notes Midnight transactions go in as the unsigned `send_mn_transaction` call, so signed-extrinsic checks (bad signature, stale era, wrong nonce) are not the no-inner-u8 case builders hit.

What the official DApp path actually shows:

- DApp Connector API 4.0.1, submit a transaction: `await connected.submitTransaction(resultTransaction)` — https://docs.midnight.network/api-reference/dapp-connector
- Node error codes, wallet SDK wrap order: `WalletFacade.submitTransaction` rethrows the FiberFailure. Print with `String(error)`, not `JSON.stringify(error)`. — https://docs.midnight.network/nodes/error-codes

This lab note does not change the public docs page, does not submit a transaction, and does not fix the public Preprod indexer or node. Pins stay Compact toolchain 0.31.1 / language 0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Classifier: `packages/preprod-hello-stub/src/submit-verify-path.mjs` (`npm run check:submit-verify` from that package).

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
