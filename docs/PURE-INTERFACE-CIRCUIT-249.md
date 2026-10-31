# Pure circuits in contract types fail at runtime with PureInterfaceCircuit (servicedesk#249)

Upstream issue: [midnightntwrk/servicedesk#249](https://github.com/midnightntwrk/servicedesk/issues/249)

Official references (do not invent APIs):

- https://docs.midnight.network/compact/reference/compact-reference (pure vs impure circuits)
- https://docs.midnight.network/api-reference/compact-runtime/type-aliases/PureCircuit
- https://docs.midnight.network/guides/compact-javascript-runtime
- https://docs.midnight.network/guides/use-compact-javascript-implementation

A Compact circuit is pure when it computes its outputs from its inputs without reference to or modification of public state (ledger) or private state (witnesses). Pure circuits are evaluable outside a transaction and carry no proof obligation. The generated module exposes them on `pureCircuits` (and also under `circuits` with a context that is ignored).

Issue #249 reports that CoIP-2 described pure circuits in contract type declarations as supported. With compactc 0.35.0 such a declaration compiles (including ZKIR and proving keys), but every cross-contract call through it fails at runtime with `ModuleResolutionError` kind `PureInterfaceCircuit` (compact-runtime). CoIP-4's list of failure kinds omitted `PureInterfaceCircuit`. A comment on the issue confirms this is intentional: pure circuits have no associated standalone proofs and therefore do not make sense as targets of cross-contract calls. The language spec and CoIP-2 are expected to be updated accordingly.

## Lab guidance (Compact ~0.31.1 / language ~0.23)

- Call pure circuits via the generated `pureCircuits` object.
- Do not declare or target pure circuits for cross-contract calls.
- An exported pure circuit is available without a circuit context and returns a bare value.

See `contracts/hello-midnight/pure-interface-circuit-249.compact` for a source-only Compact pin of a pure circuit. LOCAL-TRUE. Not compiled or deployed here. This lab does not claim a fix of the public indexer, node, or official docs.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
