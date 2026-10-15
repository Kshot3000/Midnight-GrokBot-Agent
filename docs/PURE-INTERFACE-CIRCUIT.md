# Pure circuits in contract types compile, then every call is refused

Upstream: [midnightntwrk/servicedesk#249](https://github.com/midnightntwrk/servicedesk/issues/249)

Official pure-circuit rules (do not invent a cross-contract pure call):

- https://docs.midnight.network/compact/lang-ref — "Pure and impure circuits"
- https://docs.midnight.network/guides/compact-javascript-runtime — `pureCircuits` is called with no `CircuitContext`

A pure circuit computes only from its arguments. It must not touch the ledger, call a witness, or call an impure circuit. The `pure` modifier makes the compiler reject the declaration if analysis finds those. An exported pure circuit is on the generated `pureCircuits` object, not `impureCircuits`.

Issue #249 reports that CoIP 2 (LFDT-Minokawa/compact `coips/coip-0002.md`, lines 173–187) lists pure circuits inside contract type declarations as supported. With compactc 0.35.0 such a declaration compiles (ZKIR and keys included), then every call through the type fails at runtime with `ModuleResolutionError` kind `PureInterfaceCircuit` (`runtime/src/contract.ts:606`). CoIP 4 lists 10 failure kinds; compact-runtime 0.20.0 has 11, and `PureInterfaceCircuit` is the missing one.

This lab does not edit CoIP, compactc, or midnight-docs. It does not claim the public indexer or node is fixed. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Lab files:

- `contracts/hello-midnight/pure-interface.compact` — an `export pure circuit` that only doubles a `Uint<64>` with the documented cast. No contract type declaration, no cross-contract call.
- `packages/preprod-hello-stub/src/pure-interface-invariant.mjs` — source check only. It confirms the lab file uses the pure form and flags a `pure circuit` inside a `contract { }` type declaration so a builder sees the known refusal before they compile.

Workaround until the Compact team decides whether to reject pure interface circuits at compile time: keep pure circuits in the implementing contract, call them through `pureCircuits` in JavaScript, and do not declare them pure on a contract type used for cross-contract calls.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
