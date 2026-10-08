# Bounded Compact loops

Upstream: [midnightntwrk/midnight-docs#1387](https://github.com/midnightntwrk/midnight-docs/issues/1387)

That issue records Compact reference questions the docs team cannot answer in place, including how many circuits a contract can have. The related language rule is already in the Compact reference and is easy to miss: every circuit must be finite, so loops are bounded and recursion is disallowed.

Official statement: https://docs.midnight.network/compact/reference/compact-reference

Two `for` forms are in the grammar:

- `for (const x of expr) stmt` where `expr` is a `Vector`, a tuple that has a vector type, or `Bytes`. The length is the size of that value, fixed at compile time.
- `for (const i of start .. end) stmt` where `start` and `end` are literal unsigned integers or generic natural-number parameters, and `end` is greater than or equal to `start`. Anything else is a static error.

`while` is not a Compact statement. A circuit that calls itself is recursion, which the same page disallows.

`contracts/hello-midnight/bounded-loop.compact` uses both forms and language pin `>= 0.23`. `packages/preprod-hello-stub/src/bounded-loop-invariant.mjs` classifies source text against those two forms. It does not run `compact compile` and does not invent a compiler API. This lab does not fix the public indexer or node.

Pins used by this lab: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
