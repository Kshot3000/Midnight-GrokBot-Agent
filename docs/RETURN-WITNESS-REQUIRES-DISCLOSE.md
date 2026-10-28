# Returning a witness value requires disclose()

Upstream: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official:

- https://docs.midnight.network/compact/reference/writing (Confidentiality)
- https://docs.midnight.network/compact/reference/explicit-disclosure
- https://docs.midnight.network/guides/security-best-practices

On Compact toolchain ~0.31.1 / language ~0.23 the compiler accepts returning an exported circuit argument without `disclose()` because the caller already knows the argument. It rejects returning a witness value (or a value derived from a witness) without `disclose()`. The error names the witness and the nature of the disclosure (return from the exported circuit).

A return value is handed to the calling DApp or contract. It is not written to the ledger and is not readable as raw bytes in the published transaction; the transaction carries a randomized commitment to the call's inputs and outputs. A ledger write is what makes a value public on-chain.

Lab sample: `contracts/hello-midnight/return-witness-must-disclose.compact`

This lab does not claim a fix of the public docs, compiler, indexer, or node. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
