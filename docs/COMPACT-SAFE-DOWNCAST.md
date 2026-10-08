# Compact 0.31.1 safe downcast pin

Upstream: [midnightntwrk/midnight-docs#1245](https://github.com/midnightntwrk/midnight-docs/issues/1245)

Official notes: https://docs.midnight.network/relnotes/compact/toolchain-0.31.1

Toolchain 0.31.1 is a patch on the 0.31 line. Language stays 0.23.0 and Compact runtime stays 0.16.0. The bug fix is code generation for certain casts: common-subexpression matching treated a guarded (safe) unsigned downcast and an unguarded one of the same value as the same operation, so one could be substituted for the other. The `safe` flag is now part of the comparison and of the hash.

Issue #1245 still records an EffectStream guide that tells readers to run `compact update 0.31.0`. That is the compiler the 0.31.1 notes replace, and `compact update` sets the machine-wide default: https://docs.midnight.network/getting-started/installation

The 0.31.0 notes remain relevant for circuit size. During proof construction both branches of a conditional are part of the relation. Downcasts inside an `if` are on the workaround list and can enlarge the circuit: https://docs.midnight.network/relnotes/compact/toolchain-0.31.0

`contracts/hello-midnight/safe-downcast.compact` keeps `assert(value <= 255)` outside the conditional and writes `disclose(value as Uint<8>)` only on the taken path. `packages/preprod-hello-stub/src/safe-downcast-invariant.mjs` checks that source shape. It does not compile Compact, does not call proof-server 8.1.0, and does not claim a Preprod deploy. This lab note does not fix the public indexer or node.

Pins used here: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
