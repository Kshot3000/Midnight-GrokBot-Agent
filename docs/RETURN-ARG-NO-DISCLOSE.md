# Returning a circuit argument needs no disclose()

Upstream: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official: https://docs.midnight.network/compact/reference/explicit-disclosure

The explicit disclosure page states that disclosure must be declared before storing witness data in the public ledger, returning it from an exported circuit, or passing it to another contract. Issue #266 reports two related observations on Compact toolchain 0.31.1 (language 0.23):

1. Returning an exported circuit argument compiles without `disclose()` (`return x;`). Returning a witness value is rejected until `disclose()` is added.
2. A returned value reaches the calling DApp (`callTx.private.result`) but is not present in the published transaction bytes the way a `disclose`d ledger write is.

Lab sample: `contracts/hello-midnight/return-arg-no-disclose.compact` shows `returnArg` (argument, no disclose), `returnWitness` (witness + disclose), and `storeArg` (ledger write).

This lab does not claim a fix of the public docs, compiler, indexer, or node. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
