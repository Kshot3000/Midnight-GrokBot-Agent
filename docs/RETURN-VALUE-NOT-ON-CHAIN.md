# Circuit return values reach the DApp, not the published transaction

Upstream: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official: https://docs.midnight.network/compact/reference/explicit-disclosure

The explicit disclosure page states that a Compact program must declare disclosure before storing data in the public ledger, returning it from an exported circuit, or passing it to another contract. It also says disclosure occurs when a value is returned from an exported circuit.

Issue #266 reports local-network tests (Compact 0.31.1 / language 0.23, ledger 8, midnight-js 4.1.1, proof-server 8.1.0) showing:

- A `disclose()` + ledger write places the value in the transaction `raw` bytes.
- Returning a disclosed witness value (`return disclose(secretValue())`) or returning a circuit argument (`return x`) delivers the value to the calling DApp (`callTx.private.result`) but the marker is absent from the published transaction bytes.
- Returning a circuit argument compiles without `disclose()`; returning a witness value does not.

The right reading of the docs, pending any official clarification, is that `disclose()` on a return means the value leaves the circuit and reaches the caller, not that it is written into the on-chain transaction the way a ledger store is.

Lab sample: `contracts/hello-midnight/return-value-not-onchain.compact` shows the four cases (store, returnArg, returnWitness, assertOnly) with the correct `disclose()` placement for toolchain ~0.31.1.

This lab does not claim a fix of the public docs, compiler, indexer, or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
