# Hoist relational compares out of Compact conditionals

Upstream: [midnightntwrk/midnight-docs#1387](https://github.com/midnightntwrk/midnight-docs/issues/1387)

Official notes: https://docs.midnight.network/relnotes/compact/toolchain-0.31.0

Toolchain 0.31.0 (language 0.23.0, compact-runtime 0.16.0) added temporary workarounds so operations in a branch that JavaScript does not take cannot fail while the proof is built. Proof construction still considers both branches. The workaround list includes relational comparisons (`<`, `<=`, `>`, `>=`) when an input might be unknown, plus several casts and byte conversions. The notes say the workaround can enlarge the circuit, and that builders who care about size should move those operations outside conditionally executed Compact code. The workarounds are temporary until a ZKIR change lands.

Issue #1387 tracks Compact reference gaps. Those pages are copied from the compiler repo. The published language reference does not describe this proof-construction rule. This lab note does not edit midnight-docs.

`contracts/hello-midnight/untaken-compare.compact` computes `value < cap` before the `if`, asserts that boolean, and only then `disclose`s the ledger write. `packages/preprod-hello-stub/src/untaken-compare-invariant.mjs` rejects a relational operator inside an `if` block. It does not compile Compact, does not call proof-server 8.1.0, and does not claim a Preprod deploy. This lab note does not fix the public indexer or node.

Pins used here: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Also read this run: servicedesk#236 (deploy errors that hide a runtime mismatch), servicedesk#225 (RPC 1010 wrapped as a generic submission error), midnight-docs#1509 (1010 without an inner u8, and code-less TransactionInvalidError), example-hello-world#41 (unused axios / testcontainers). None of those are fixed here.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
