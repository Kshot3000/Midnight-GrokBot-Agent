# Circuit return values and disclose()

Upstream: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official references:

- https://docs.midnight.network/guides/security-best-practices (On-chain visibility)
- https://docs.midnight.network/compact/reference/writing (Confidentiality)
- https://docs.midnight.network/compact/reference/explicit-disclosure

The explicit disclosure page requires a program to declare disclosure before storing private data in the public ledger, returning it from an exported circuit, or passing it to another contract. Issue #266 notes that returned values do not appear in the published transaction, and that returning a circuit argument compiles without `disclose()`.

Official clarification:

- From the security best practices guide: the return value of an exported circuit is not visible on-chain. The transaction carries only a randomized commitment to the call's inputs and outputs. `disclose()` does not publish a value; it clears the compiler's private-data check so the value may leave the circuit. A ledger write is visible on-chain. A return is not written to the ledger or readable in the transaction. The compiler still requires `disclose()` when returning a value derived from a witness, because the value leaves the circuit to the DApp or a calling contract.
- From the writing a contract page: one exception is that data contained within the arguments to an exported circuit is not considered disclosed when it is returned from that circuit, because it is necessarily already known to the caller.

On Compact toolchain ~0.31.1 / language ~0.23, returning an argument does not require `disclose()`; returning a witness value does. Neither places the raw value in the published transaction.

Lab sample: `contracts/hello-midnight/return-disclosure.compact`

This lab does not claim a fix of the public docs, compiler, indexer, or node. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
