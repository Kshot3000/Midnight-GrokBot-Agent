# Pure circuits in contract types: PureInterfaceCircuit (servicedesk#249)

Upstream issue: [midnightntwrk/servicedesk#249](https://github.com/midnightntwrk/servicedesk/issues/249)

Official references (do not invent APIs):

- https://docs.midnight.network/compact/reference/compact-reference (contract types and pure circuits)
- https://docs.midnight.network/guides/compact-javascript-runtime (pureCircuits export)
- https://docs.midnight.network/api-reference/compact-runtime/type-aliases/InterfaceCircuitDeclaration
- https://docs.midnight.network/api-reference/compact-runtime (notes on pureCircuits)

The Compact language reference documents `pure` as an optional keyword on circuit declarations and on circuits inside contract type (`contract T { ... }`) forms. A contract satisfies a contract type when exported circuits match the declared signatures, including the `pure` flag when the type declaration requires it.

The JavaScript runtime guide states that an exported pure circuit is available on the generated `pureCircuits` object and can be called without a circuit context. Impure circuits require a context and produce proof data.

Issue #249 reports that, on compactc 0.35.0 / compact-runtime 0.20.0, a pure circuit declared inside a contract type compiles (including ZKIR and proving keys) but every call through the interface fails at runtime with `ModuleResolutionError` kind `PureInterfaceCircuit`. CoIP 4's listed failure kinds omit this one. The API reference for compact-runtime 0.20.0 notes that a pure circuit in a contract type cannot be called and that nothing dispatches through it (see the `pureCircuits` field comment referencing `PureInterfaceCircuit`).

This is a known limitation on the ledger-9 / 0.34+ toolchain line. The lab pin remains Compact ~0.31.1 / language ~0.23 (ledger 8). On that pin, pure circuits exported from a contract (not via an interface) are the documented path; interface pure circuits are outside the supported matrix for networks.

## Lab pin

See `contracts/hello-midnight/pure-circuit-pin.compact` for a source-only Compact example of an exported pure circuit that matches the official 0.31.1 surface. LOCAL-TRUE. Not compiled or deployed here. This lab does not claim a fix of the public indexer, node, runtime, or official docs.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
