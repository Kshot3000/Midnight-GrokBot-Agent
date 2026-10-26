# Return values leave the circuit but are not in the published transaction

Upstream: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official:

- https://docs.midnight.network/compact/reference/explicit-disclosure
- https://docs.midnight.network/guides/security-best-practices
- https://docs.midnight.network/guides/build-a-private-smart-contract

Issue #266 (opened 2026-10-21, Compact toolchain 0.31.1 / language ~0.23, also checked on 0.35.0) reports two points about return values:

1. Returning a value (with or without `disclose()`) reaches the calling DApp via `callTx.private.result` but is **not** present in the published transaction bytes. A ledger write of a disclosed value is present; a pure `assert` is not. Official security best practices confirm: "The return value of an exported circuit | No, the transaction carries only a randomized commitment to the call's inputs and outputs." and "A return value is not written to the ledger or readable in the transaction; only a randomized commitment to the call's inputs and outputs is."

2. Returning a circuit argument compiles without `disclose()` (the caller already knows its own arguments). Returning a witness value is rejected unless wrapped in `disclose()`. Official docs state that the compiler requires `disclose()` to return a value that comes from a witness function, because the value leaves the circuit to the DApp or a calling contract, but does not require it for plain arguments.

`disclose()` itself does not publish a value. It clears the compiler's private-data check so the value may leave the circuit (ledger write, return, or contract-to-contract call). Ledger writes are visible on-chain; returns are not.

Lab sample: `contracts/hello-midnight/return-value-disclosure.compact` shows `return x` on an argument (accepted), `return disclose(secret())` on a witness (required), and a disclosed ledger write.

`packages/preprod-hello-stub/src/return-value-disclosure-invariant.mjs` is a source check only. It does not compile Compact, does not call proof-server 8.1.0, and does not claim a Preprod deploy or a fix of the public indexer or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
