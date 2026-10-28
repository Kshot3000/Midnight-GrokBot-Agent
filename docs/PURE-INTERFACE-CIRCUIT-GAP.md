# Pure circuits in contract types (servicedesk#249)

Upstream: https://github.com/midnightntwrk/servicedesk/issues/249

Official:
- Compact reference (circuit declarations, pure, contract types): https://docs.midnight.network/compact/reference/compact-reference
- Using Compact contracts from JavaScript (pureCircuits): https://docs.midnight.network/guides/compact-javascript-runtime
- Support matrix: https://docs.midnight.network/relnotes/support-matrix — Compact toolchain 0.31.1, language 0.23, compact-runtime 0.16.0 on Preprod/Mainnet

servicedesk#249 reports that CoIP 2 lists pure circuits inside contract type declarations as supported. On compactc 0.35.0 those declarations compile (including ZKIR and keys), but every call fails at runtime with ModuleResolutionError kind PureInterfaceCircuit. CoIP 4 omits that failure kind. The reproduction uses compact-runtime 0.20.0 and Midnight.js 5.x (ledger 9 line).

This lab pins Compact ~0.31.1 / language ~0.23 / midnight-js 4.1.1 / compact-runtime 0.16.0 / proof-server 8.1.0. Ordinary `export pure circuit` is the form the JavaScript runtime guide documents for the current networks: the compiler emits JavaScript only, callable via pureCircuits with no context.

Do not put `pure circuit` inside a contract type declaration when targeting the pinned stack. The failure mode above is on the 0.35 / 0.20 line; the lab does not claim the public compiler or runtime is fixed.

Sample: `contracts/hello-midnight/pure-circuit-export.compact` (exported pure circuit + one impure circuit). Classifier: `packages/preprod-hello-stub/src/pure-interface-gap.mjs`.

LOCAL-TRUE. Does not call the public indexer or node. Does not invent APIs.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
