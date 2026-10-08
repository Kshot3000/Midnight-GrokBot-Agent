# WalletFacade balance/finalization can hang before submit

Upstream: https://github.com/midnightntwrk/servicedesk/issues/194

Open servicedesk report: after proof generation, the operator enters `wallet-balance/finalization-enter` and the call does not return. Submission is never reached. The process stays CPU-bound and the report attributes operator RSS growth (about 510 MiB to about 1.74 GiB) to that boundary, then a watchdog kills it. A paired control on the same path returns. This lab note only classifies that published symptom. It does not patch wallet-sdk, and it does not claim a public indexer or node fix.

## What the official pages publish

Wallet guide, balance then finalize then submit: https://docs.midnight.network/sdks/official/wallet-developer-guide

Named calls on that page and the wallet SDK reference (https://docs.midnight.network/api-reference/wallet-sdk):

- `balanceUnprovenTransaction` before proof generation
- `balanceFinalizedTransaction` after proofs exist (DUST sponsorship uses `tokenKindsToBalance`)
- `finalizeRecipe`
- `submitTransaction`

Midnight.js transaction flow puts balance on the wallet provider and submit on the midnight provider: https://docs.midnight.network/api-reference/midnight-js

None of those pages document a timeout, an RSS ceiling, or a recovery call for a non-returning balance. Do not invent one.

## How this differs from a node rejection

servicedesk#225 / the 1010 decoder: the node answers and `submitTx` rejects. Issue 194 never reaches `submitTransaction`, so an RPC body is not available. An indexer 503 or a backwards preprod head is also a different class.

## Lab check

`packages/preprod-hello-stub/src/wallet-balance-stall.mjs` maps the enter marker, a non-returning balance or finalize call, and the reported RSS growth. It leaves 1010 and indexer text alone. `node --test` is not the runner; `node --test test/wallet-balance-stall.test.mjs` covers it. LOCAL-TRUE. No deploy is claimed.

Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
