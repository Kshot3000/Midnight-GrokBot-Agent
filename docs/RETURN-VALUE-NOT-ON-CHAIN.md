# Circuit return values are not published on-chain

Upstream: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official: https://docs.midnight.network/compact/reference/explicit-disclosure

The explicit disclosure page states that a Compact program must declare disclosure before storing data in the public ledger, returning it from an exported circuit, or passing it to another contract. A reader can conclude that a returned value becomes public like a ledger write.

Issue #266 (opened 2026-10-21) tested this on a local network with Compact toolchain 0.31.1 (language 0.23). After calling circuits that return a disclosed witness or a circuit argument, the returned value reaches the calling DApp (`callTx.private.result`) but is absent from the published transaction bytes read back from the indexer. A disclosed value stored in the ledger is present in the transaction.

The same issue notes that returning a circuit argument compiles without `disclose()` on both 0.31.1 and 0.35.0, while returning a witness value is rejected unless wrapped in `disclose()`. The assumption is that the caller already knows its own arguments.

Lab samples:

- `contracts/hello-midnight/return-arg-no-disclose.compact` — returns an argument without `disclose()` and a witness with `disclose()`.
- Classifier: `packages/preprod-hello-stub/src/explicit-disclosure-return.mjs` (source check only; does not compile Compact, call proof-server 8.1.0, or touch the public indexer or node).

This lab does not claim a fix of the public docs, compiler, indexer, or node. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
