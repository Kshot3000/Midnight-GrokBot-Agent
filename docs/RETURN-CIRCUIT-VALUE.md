# Returning values from exported Compact circuits

Upstream: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official: https://docs.midnight.network/compact/reference/explicit-disclosure

The explicit disclosure page states that a program must declare disclosure before storing data in the public ledger, returning it from an exported circuit, or passing it to another contract. It also notes that disclosure occurs when a value is returned from an exported circuit.

Issue #266 reports two findings from local testing on Compact 0.31.1 (language 0.23):

1. A returned value (even wrapped in `disclose()`) reaches the calling DApp via `callTx.private.result` but does not appear in the published transaction bytes fetched from the indexer. Storing via a ledger write does appear in the transaction.
2. Returning a circuit argument compiles without `disclose()`. Returning a witness value does not; the compiler rejects it with a potential witness-value disclosure error.

These samples illustrate the compiler rules. They do not claim a change to the public docs, compiler, indexer, or node.

Lab samples:
- `contracts/hello-midnight/return-arg-no-disclose.compact` — returns an argument without `disclose()`.
- `contracts/hello-midnight/return-witness-must-disclose.compact` — returns a disclosed witness value.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
