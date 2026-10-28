# Disclosure: ledger write vs circuit return (servicedesk#266)

Upstream issue: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official reference (do not invent APIs):

- https://docs.midnight.network/compact/reference/explicit-disclosure

The official page states that a Compact program must explicitly declare disclosure of potentially private data before storing it in the public ledger, returning it from an exported circuit, or passing it to another contract. Issue #266 reports test results on Compact 0.31.1 / language 0.23 (and 0.35.0 for compile cases) that refine how that rule is applied in practice.

## Reported compiler outcomes (0.31.1 / language ~0.23)

| Case | Behaviour on 0.31.1 |
| --- | --- |
| `return x;` on a circuit argument | Accepted (no `disclose()` required). Caller already knows the argument. |
| `return secretNum();` on a witness | Rejected. Requires `disclose()`. |
| `assert(secretNum() > 5, ...)` | Accepted. No `disclose()` required. |
| `assert(m.member(k), ...)` where `k` is an argument | Rejected. Map key from argument requires `disclose()` even inside the assert. |
| Conditional branch on a witness that then writes the ledger | Rejected. Condition requires `disclose()`. |

## Reported on-chain behaviour

A local network probe (midnight-node 1.0.0 / ledger 8, proof-server 8.1.0, midnight-js 4.1.1) showed:

- A ledger write of a disclosed argument places the value in the published transaction raw bytes.
- Returning a disclosed witness value or a circuit argument hands the value to the calling DApp (`callTx.private.result`) but the marker was not present in the published transaction raw bytes.

The issue asks whether `disclose()` on a return means "this leaves the circuit and reaches the DApp" rather than "this goes on chain." Contract-to-contract behaviour was not tested on ledger 8.

## Lab pin

See `contracts/hello-midnight/disclosure-return-vs-ledger-266.compact` for a source-only Compact pin of the accepted and rejected forms. LOCAL-TRUE. Not compiled or deployed here. This lab does not claim a fix of the public indexer, node, or official docs.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
