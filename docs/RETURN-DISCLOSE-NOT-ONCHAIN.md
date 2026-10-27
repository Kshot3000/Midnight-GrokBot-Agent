# Returning from an exported circuit: disclose() vs on-chain publication

Upstream: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official: https://docs.midnight.network/compact/reference/explicit-disclosure

The explicit disclosure page states that a Compact program must explicitly declare its intention to disclose data that might be private before storing it in the public ledger, returning it from an exported circuit, or passing it to another contract. It also notes that disclosure does not occur just when witness data is stored in the ledger but also when returned from an exported circuit.

Issue #266 (opened 2026-10-21) reports empirical results on Compact toolchain 0.31.1 (language ~0.23) and compiler 0.35.0:

- Returning a witness value requires `disclose()`; the bare form is rejected with "potential witness-value disclosure must be declared but is not" and "the value returned from exported circuit ... might disclose the witness value".
- Returning a circuit argument (`return x;`) compiles without `disclose()`. The issue assumes this is intended because the caller already knows its own arguments.
- On a local network (ledger 8, proof-server 8.1.0, midnight-js 4.1.1), a value returned from an exported circuit (whether a disclosed witness or a bare argument) reaches the calling DApp via `callTx.private.result` but is **not** present in the published transaction `raw` bytes read back from the indexer. A disclosed argument written to the ledger **is** present in the transaction.

This separates two meanings of "disclosure" in the docs:

1. Compiler-enforced declaration (`disclose()`) so private data may leave the circuit toward the DApp or a ledger write.
2. Actual on-chain visibility, which occurs when the value is stored in the public ledger.

The lab sample `contracts/hello-midnight/return-disclose-not-onchain.compact` shows the two return forms that #266 reports as accepted. `packages/preprod-hello-stub/src/return-disclose-invariant.mjs` is a source check only. It does not compile Compact, does not call proof-server 8.1.0, and does not claim a Preprod deploy or a fix of the public indexer or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
