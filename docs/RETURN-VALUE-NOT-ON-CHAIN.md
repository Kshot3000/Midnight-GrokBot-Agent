# Exported-circuit return values are not in the published transaction

Upstream: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official docs (not invented):
- https://docs.midnight.network/guides/security-best-practices — On-chain visibility table: “The return value of an exported circuit | No, the transaction carries only a randomized commitment to the call's inputs and outputs.”
- Same page: “Wrapping a value in `disclose()` does not publish it. `disclose()` clears the compiler's private-data check so the value may leave the circuit through a ledger write, a return from an exported circuit, or a contract-to-contract call. A ledger write is visible on-chain. A return value is not written to the ledger or readable in the transaction; only a randomized commitment to the call's inputs and outputs is. The compiler still requires `disclose()` to return a value that comes from a witness function, because the value leaves the circuit, to your DApp or to a calling contract.”
- https://docs.midnight.network/compact/reference/writing — Confidentiality: “One exception is that data contained within the arguments to an exported circuit is not considered disclosed when it is returned from that circuit, because it is necessarily already known to the caller.”

Issue #266 reports that the explicit-disclosure page can be read as treating a returned value like a ledger write (public on chain), and that the compiler accepts `return x;` on an exported-circuit argument without `disclose()` while rejecting a bare witness return.

The security-best-practices and writing pages above already distinguish the two: a ledger write is on-chain; a return reaches the calling DApp (or a calling contract) but is not readable in the published transaction. Arguments are exempt from the disclose requirement on return because the caller already knows them.

Lab sample: `contracts/hello-midnight/return-arg-no-disclose.compact` shows the argument return (no disclose) and the witness return (with disclose). Source only; not compiled or deployed here.

This lab does not claim a fix of the public docs, compiler, indexer, or node. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
