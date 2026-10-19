# Pure circuits in contract types compile but calls are refused

Upstream: [midnightntwrk/servicedesk#249](https://github.com/midnightntwrk/servicedesk/issues/249)

Official sources (do not invent APIs):
- https://docs.midnight.network/compact/reference/compact-reference (Pure and impure circuits)
- https://docs.midnight.network/guides/compact-javascript-runtime
- https://docs.midnight.network/api-reference/compact-runtime/type-aliases/InterfaceCircuitDeclaration

## Official pure/impure rules

A Compact circuit is pure if it computes its outputs from its inputs without reference to or modification of public state (via the ledger) or private state (via witnesses).

The compiler treats a circuit as impure if the body contains a ledger operation, a call to any impure circuit, or a call to a witness.

Prefix the definition with the `pure` modifier (after `export` if present). The only effect is that the compiler flags the declaration if its analysis finds the circuit is actually impure. This ensures the circuit appears in the `PureCircuits` type and the `pureCircuits` constant of the generated TypeScript module.

Pure circuits are callable without a circuit context and do not return a wrapped `CircuitResults` value. Impure circuits require the context and return wrapped results.

`InterfaceCircuitDeclaration` records the declared `pure` keyword (not inferred purity).

## Reported gap (servicedesk#249)

CoIP 2 describes pure circuits in contract type declarations as supported. With compactc 0.35.0 a declaration compiles (including ZKIR and proving keys), but every call fails at runtime with `ModuleResolutionError` kind `PureInterfaceCircuit`. CoIP 4 lists failure kinds but omits `PureInterfaceCircuit`.

This lab pins Compact ~0.31.1 / language ~0.23. The note records the upstream report only. It does not claim a fix in the public compiler, indexer, or node.

## Lab stand-in

`contracts/hello-midnight/pure-circuit.compact` exports a pure circuit that only adds two disclosed `Uint<64>` values and returns the sum. It does not touch the ledger, call a witness, or declare a contract type interface.

`packages/preprod-hello-stub/src/pure-circuit-invariant.mjs` is a source check only. It does not compile Compact, does not call proof-server 8.1.0, and does not submit a transaction.

This lab note does not fix the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
