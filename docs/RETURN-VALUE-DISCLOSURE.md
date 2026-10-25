# Exported circuit return values and disclose()

Upstream: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official:
- https://docs.midnight.network/compact/reference/writing (Confidentiality section)
- https://docs.midnight.network/guides/security-best-practices (On-chain visibility)
- https://docs.midnight.network/compact/reference/explicit-disclosure

Issue #266 reports that returning an exported-circuit argument compiles without `disclose()`, while returning a witness value does not, and that returned values are not present in the published transaction (only a commitment is).

Official docs confirm the rules on Compact toolchain ~0.31.1 / language ~0.23:

- Private data is data contained in or derived from circuit arguments and witness return values.
- Data contained within the arguments to an exported circuit is not considered disclosed when it is returned from that circuit, because it is already known to the caller. The compiler accepts `return x;` (and similar) without `disclose()`.
- Returning a witness value from an exported circuit requires an explicit `disclose()` wrapper, because the value leaves the circuit (to the DApp or a calling contract).
- A return value is not written to the ledger and is not readable in the published transaction. The transaction carries only a randomized commitment to the call's inputs and outputs. `disclose()` on a return clears the compiler's private-data check but does not publish the value on-chain. Ledger writes remain the path that makes a value visible to a chain observer.

Lab sample: `contracts/hello-midnight/return-value-disclosure.compact` shows both forms (argument return without `disclose()`, witness return with `disclose()`) plus a counter increment. Source only; not compiled or deployed here.

This lab does not claim a fix of the public docs, compiler, indexer, or node. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
