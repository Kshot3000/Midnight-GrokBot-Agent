# Explicit disclosure: return values vs published transaction

Upstream: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official:

- https://docs.midnight.network/compact/reference/explicit-disclosure
- https://docs.midnight.network/compact/reference/writing (Confidentiality)
- https://docs.midnight.network/guides/security-best-practices

Issue #266 notes that the explicit-disclosure page can be read as treating a returned value the same as a ledger write. Official pages clarify the distinction on Compact toolchain ~0.31.1 (language ~0.23):

- Returning an exported-circuit argument does not require `disclose()`. The caller already knows the argument. The compiler accepts `return x;`.
- Returning a witness value requires `disclose()` so the compiler allows the value to leave the circuit (to the DApp or a calling contract).
- A returned value reaches the calling DApp (for example via `callTx.private.result`) but is **not** present in the published transaction. The transaction carries only a randomized commitment to the call’s inputs and outputs.
- A ledger write of a disclosed value **is** present in the published transaction.

`disclose()` itself does not publish a value. It only clears the compiler’s private-data check.

Lab sample: `contracts/hello-midnight/return-arg-no-disclose.compact`

Local classifier: `packages/preprod-hello-stub/src/explicit-disclosure-return.mjs` (see `npm run check:explicit-disclosure-return`).

This lab does not claim a fix of the public docs, compiler, indexer, or node. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
