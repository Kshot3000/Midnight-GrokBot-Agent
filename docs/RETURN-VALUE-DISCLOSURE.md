# Explicit disclosure: return values vs ledger writes

Upstream: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official:

- https://docs.midnight.network/compact/reference/explicit-disclosure
- https://docs.midnight.network/guides/security-best-practices
- https://docs.midnight.network/concepts/how-midnight-works/compact-privacy-first-language
- https://docs.midnight.network/compact/reference/writing

Issue #266 (Compact toolchain 0.31.1 / language ~0.23, also checked on 0.35.0) reports that the explicit disclosure page describes returning a value from an exported circuit as a disclosure equivalent to a ledger write. On-chain probes showed the opposite:

- A disclosed value written to a ledger field appears in the published transaction bytes.
- A value returned from an exported circuit (whether a disclosed witness result or a plain circuit argument) reaches the calling DApp (`callTx.private.result`) but is **not** present in the transaction `raw` bytes. The transaction carries only a randomized commitment to the call's inputs and outputs.

Official pages already state the distinction:

- From security-best-practices (On-chain visibility): "Wrapping a value in `disclose()` does not publish it. ... A ledger write is visible on-chain. A return value is not written to the ledger or readable in the transaction; only a randomized commitment to the call's inputs and outputs is. The compiler still requires `disclose()` to return a value that comes from a witness function, because the value leaves the circuit, to your DApp or to a calling contract."
- From compact-privacy-first-language: "A ledger write makes the value public. A return value goes to your DApp or to a calling contract. It is not written to the ledger or readable in the transaction..."
- From writing a contract: "One exception is that data contained within the arguments to an exported circuit is not considered disclosed when it is returned from that circuit, because it is necessarily already known to the caller."

Compiler behavior matching the issue:

- `return x;` on an exported circuit argument compiles (no `disclose()` needed).
- `return secretNum();` (witness) is rejected until wrapped in `disclose()`.
- `assert` on a secret is accepted without `disclose()`.
- A branch on a witness that then writes the ledger requires `disclose()` on the controlling expression.

This lab note cites the upstream issue and the official clarification. It does not claim a fix of the public docs, compiler, indexer, or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
