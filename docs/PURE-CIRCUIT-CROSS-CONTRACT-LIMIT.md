# Pure circuit cross-contract call limit

Upstream: https://github.com/midnightntwrk/servicedesk/issues/249

Official: https://docs.midnight.network/compact/lang-ref
(pure circuits compute outputs from inputs without ledger or witnesses; they appear in `pureCircuits` and do not generate standalone proofs)

## What the issue reports

Declaring a pure circuit inside a contract type (for cross-contract calls) compiles under Compact ~0.31 / language ~0.23. Every subsequent call is refused at runtime with `ModuleResolutionError` kind `PureInterfaceCircuit`. CoIP-4's failure-kind list omitted this variant at the time of the report.

## Current status (lab note)

Maintainers confirmed this is a language decision, not a defect to be patched in the runtime: pure circuits have no associated standalone proofs, so they are not valid targets of cross-contract calls. Spec and CoIP updates will record the restriction.

## Lab guidance (do not invent APIs)

- Keep pure circuits on the implementing contract and call them via the generated `pureCircuits` object (no circuit context).
- Do not declare `pure circuit` inside a contract type used for cross-contract calls.
- Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.
- This lab file does not compile Compact, does not call midnight-js, and does not claim any public indexer or node is fixed.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
