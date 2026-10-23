# Returned circuit values leave the circuit, not the published transaction

Upstream: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official:

- https://docs.midnight.network/guides/security-best-practices — "The return value of an exported circuit | No, the transaction carries only a randomized commitment to the call's inputs and outputs." "A return value is not written to the ledger or readable in the transaction; only a randomized commitment to the call's inputs and outputs is. The compiler still requires disclose() to return a value that comes from a witness function, because the value leaves the circuit, to your DApp or to a calling contract."
- https://docs.midnight.network/compact/reference/writing — "One exception is that data contained within the arguments to an exported circuit is not considered disclosed when it is returned from that circuit, because it is necessarily already known to the caller."
- https://docs.midnight.network/compact/reference/explicit-disclosure — the page that issue #266 finds unclear on the two meanings of "disclosure".

Issue #266 tested four markers on a local network (Compact 0.31.1 / language 0.23, ledger 8, midnight-js 4.1.1, proof-server 8.1.0). A disclosed argument written to the ledger appeared in the published transaction raw bytes. An argument used only in assert did not. A returned witness value and a returned circuit argument reached the calling DApp via `callTx.private.result` but were absent from the transaction. Returning a circuit argument compiled without `disclose()`; returning a witness did not.

Lab sample: `contracts/hello-midnight/return-disclose.compact` shows both cases under the current pins. It does not claim a fix of the public docs, compiler, indexer, or node.

This lab does not invent APIs. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
