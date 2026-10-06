# No published Compact circuit maximum

Upstream: [midnightntwrk/midnight-docs#1387](https://github.com/midnightntwrk/midnight-docs/issues/1387)

Kapa could not answer how many circuits a Compact contract may have. The Compact reference describes a contract as a set of circuits and says a program has at most one constructor. It does not publish a numeric circuit cap. This lab does not invent one.

Official: https://docs.midnight.network/compact/reference/compact-reference

A circuit that touches the public ledger requires a proof and a proving key. Cost scales with those keys (see also servicedesk#203 for prover-key size), not with an unpublished count.

Lab sample: `contracts/hello-midnight/circuit-count.compact` exports `ping` and `pingAgain`. Both call `Counter.increment(1)`. Two is a visible count, not a protocol limit. `packages/preprod-hello-stub/src/circuit-count-invariant.mjs` counts `export circuit` declarations, rejects a second constructor, and rejects a comment that states a numeric protocol maximum.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Source check only. Not compiled in this change. Not deployed. Not a fix to the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
