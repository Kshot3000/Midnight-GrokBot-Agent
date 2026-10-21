# Explicit disclosure: return to the DApp is not the same as a ledger write

Upstream: https://github.com/midnightntwrk/servicedesk/issues/266

Official: https://docs.midnight.network/compact/reference/explicit-disclosure

The Explicit disclosure page requires a Compact program to declare disclosure before storing witness data in the public ledger, returning it from an exported circuit, or passing it to another contract. The page also says disclosure does not occur just when witness data is stored in the ledger but also when returned from an exported circuit.

servicedesk#266 reports two observations against Compact 0.31.1 (language ~0.23) and midnight-js 4.1.1:

1. A value returned from an exported circuit reaches the calling DApp (`callTx.private.result`) but is not present in the published transaction bytes read back from the indexer. A ledger store of a disclosed argument is present in the transaction. An asserted-only argument is not.
2. Returning a circuit argument (`return x;` or `return a + b;`) compiles without `disclose()`. Returning a witness value is rejected with "potential witness-value disclosure must be declared but is not" and "the value returned from exported circuit ... might disclose the witness value".

This lab note does not invent APIs, does not claim a fix to the public indexer or node, and does not patch the upstream docs. It only records the published wording and the reported compiler/on-chain distinction so builders on the pinned stack can separate the two meanings.

## Official wording (quoted)

From the Explicit disclosure page:

> a Compact program must explicitly declare its intention to disclose data that might be private before storing it in the public ledger, returning it from an exported circuit, or passing it to another contract.

> This example also illustrates that disclosure does not occur just when witness data is stored in the ledger but also when returned from an exported circuit.

## Reported compiler outcomes (from the issue, Compact 0.31.1)

- `return x;` on an exported-circuit argument: accepted.
- `return a + b;` on arguments: accepted.
- `return secretNum();` (witness): rejected.
- `assert(m.member(k))` on an argument used as a Map key: rejected (needs disclose).
- Branching on a witness then writing the ledger: rejected.
- `assert` on a secret: accepted.

## Lab helper

`packages/preprod-hello-stub/src/explicit-disclosure-return.mjs` classifies a source string against those reported cases. It does not compile Compact and does not call a proof server. LOCAL-TRUE.

Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
