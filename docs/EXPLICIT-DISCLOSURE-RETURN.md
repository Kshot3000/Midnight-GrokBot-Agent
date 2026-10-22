# Explicit disclosure: circuit returns vs ledger stores

Upstream: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official:

- https://docs.midnight.network/compact/reference/explicit-disclosure
- https://docs.midnight.network/getting-started/hello-world
- https://docs.midnight.network/compact/reference/compact-reference

From the explicit disclosure page: a Compact program must declare disclosure "before storing it in the public ledger, returning it from an exported circuit, or passing it to another contract". The page also notes that disclosure does not occur just when witness data is stored in the ledger but also when returned from an exported circuit.

Issue #266 (opened 2026-10-21) reports two observations on Compact toolchain 0.31.1 (language 0.23) and 0.35.0:

1. Circuit return values (whether from a witness via `disclose()` or from an argument) are returned to the calling DApp (`callTx.private.result`) but are **not** present in the published transaction bytes read back from the indexer. A ledger store of a disclosed value **is** present. This suggests `disclose()` on a return means "this leaves the circuit and reaches the DApp", not "this goes on chain".

2. Returning a circuit argument compiles without `disclose()` (`return x;`), while returning a witness value without `disclose()` is rejected. Arguments are known to the caller, so the compiler treats them as already disclosed to the caller.

Lab samples (not compiled here, language pin ~0.23):

- `contracts/hello-midnight/return-arg-no-disclose.compact` — returns an argument without `disclose()`.
- `contracts/hello-midnight/return-witness-disclose.compact` — returns a witness only after `disclose()`.

This lab does not claim a fix of the public docs site, indexer, or node. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
