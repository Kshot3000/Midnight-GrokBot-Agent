# Safe vs unguarded unsigned downcast (Compact 0.31.1)

Official: [Compact toolchain 0.31.1](https://docs.midnight.network/relnotes/compact/toolchain-0.31.1)

Version 0.31.1 is a patch on the 0.31 line that fixes code generation for certain casts. The compiler's common-subexpression matching previously treated a guarded (safe) unsigned downcast and an unguarded one of the same value as the same operation, so one could be substituted for the other in the generated circuit. The `safe` flag is now part of the comparison and of the hash, so the two forms stay distinct.

Language version and Compact runtime stay the same (0.23.0 / 0.16.0). Public networks continue to pin toolchain 0.31.1 / runtime 0.16.0: [support matrix](https://docs.midnight.network/relnotes/support-matrix).

Upstream related: [midnightntwrk/midnight-docs#1564](https://github.com/midnightntwrk/midnight-docs/issues/1564) (API reference documents 0.20.0 while networks run 0.16.0). This lab does not edit midnight-docs and does not claim a public indexer or node fix.

Lab contract: `contracts/hello-midnight/safe-downcast-distinct.compact` shows an explicit `assert(value <= 255, ...)` before `value as Uint<8>` so the circuit can still reject an out-of-range value. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Official docs only: https://docs.midnight.network/.

Also read this run (not fixed here): servicedesk#264 (Stagenet validator-04 stalled), servicedesk#254 (faucet amount unit), servicedesk#252 (proof-server 9.0.0-rc.9 DUST 170), midnight-docs#1587 (quickstart scaffolder), midnight-docs#1579 (bboard guides), example-hello-world#41 (unused deps).

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
