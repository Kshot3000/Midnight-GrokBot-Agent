# Circuit return values are not in the published transaction

Upstream: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official: https://docs.midnight.network/compact/reference/explicit-disclosure

The explicit disclosure page states that a program must declare disclosure before storing it in the public ledger, returning it from an exported circuit, or passing it to another contract. It also notes that disclosure does not occur just when witness data is stored in the ledger but also when returned from an exported circuit.

Issue #266 (opened 2026-10-21) tested this on a local network with Compact toolchain 0.31.1 (language 0.23) and proof-server 8.1.0. Markers returned from circuits (with or without `disclose()` on a witness) reached the calling DApp (`callTx.private.result`) but were absent from the published transaction `raw` bytes read from the indexer. Only a value stored to the ledger with `disclose()` appeared on-chain.

The same issue reports that returning a circuit argument compiles without `disclose()` (accepted on 0.31.1 and 0.35.0), while returning a witness value is rejected without it. This is consistent with the caller already knowing its own arguments.

Lab sample: `contracts/hello-midnight/return-arg-no-disclose.compact` demonstrates the compile-time rules (argument return without disclose, witness return with disclose, ledger store with disclose). It is source only and does not prove or submit.

This lab does not claim a fix of the public docs, compiler, indexer, or node. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
