# Generic for bounds, and no return from a for

Upstream: [midnightntwrk/midnight-docs#1387](https://github.com/midnightntwrk/midnight-docs/issues/1387)

The Compact reference is auto-populated and owned by mn-codeowners-compact, which is why #1387 records language questions instead of editing the page. Two rules from the current reference are easy to miss when a circuit is unrolled for a finite proof:

1. A range `for (const i of start..end)` may use an unsigned integer literal or a generic natural-number parameter. Generic natural-number parameters are declared with a `#` prefix (`#N`) and referenced without the hash. Compact toolchain 0.31.0 is the note that says those bounds may be generic parameters: https://docs.midnight.network/relnotes/compact/toolchain-0.31.0
2. `return` cannot leave a `for`. The reference says return statements cannot be used to return from within for statements: https://docs.midnight.network/compact/reference/compact-reference

`contracts/hello-midnight/for-generic-bound.compact` is the lab sample (`countGeneric<#N>` iterating `0..N`). It is not compiled here. `packages/preprod-hello-stub/src/for-generic-bound.mjs` only scans source text. It does not call the compiler, does not invent a Compact API, and does not claim to fix the public indexer or node.

Pins used by this lab: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
