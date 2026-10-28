# Pure circuits and cross-contract calls (servicedesk#249)

Upstream issue: [midnightntwrk/servicedesk#249](https://github.com/midnightntwrk/servicedesk/issues/249)

Official references (do not invent APIs):

- https://docs.midnight.network/compact/reference/compact-reference (Pure and impure circuits)
- https://docs.midnight.network/guides/compact-javascript-runtime (pureCircuits export and local calls)
- https://docs.midnight.network/concepts/how-midnight-works/compact-privacy-first-language

A Compact circuit is pure when it computes its outputs from its inputs without reference to or modification of public state (via the ledger) or private state (via witnesses). The compiler treats a circuit as impure if its body contains a ledger operation, a call to any impure circuit, or a call to a witness.

The `pure` modifier (which must follow `export` if present) has the effect that the compiler flags the declaration as an error if analysis determines the circuit is actually impure. It also ensures the circuit appears in the generated `PureCircuits` type and via the `pureCircuits` constant in the TypeScript/JavaScript module.

From the JavaScript runtime guide (samples using Compact toolchain 0.31.1 / language version 0.23):

- An exported pure circuit compiles to JavaScript only; the compiler does not emit ZKIR or prover/verifier keys for it.
- It is callable directly as `pureCircuits.name(...)` with native values and no `CircuitContext`.
- Impure circuits require a context and return a wrapped result that includes proof data.

Issue #249 reports that pure circuits appearing in contract types compile, but every call (in the cross-contract sense) is refused, and CoIP 4 omits `PureInterfaceCircuit`. A maintainer comment states this is not a bug but a decision: CoIP-2 did not restrict calling pure circuits from other contracts when it should have. Pure circuits do not make sense as targets of cross-contract calls because they have no associated standalone proofs. The language specification and CoIP-2 will be updated to say as much.

## Lab pin

See `contracts/hello-midnight/pure-circuit-cross-call-249.compact` for a source-only Compact pin of an `export pure` circuit that is usable by local call. LOCAL-TRUE. Not compiled or deployed here. This lab does not claim a fix of the public compiler, indexer, node, or official docs.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
