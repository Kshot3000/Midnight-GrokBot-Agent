# Return values leave the circuit but are not in the published transaction

Upstream: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official:

- https://docs.midnight.network/concepts/how-midnight-works/compact-privacy-first-language
- https://docs.midnight.network/compact/reference/writing
- https://docs.midnight.network/compact/reference/explicit-disclosure
- https://docs.midnight.network/guides/security-best-practices
- https://docs.midnight.network/guides/build-a-private-smart-contract

Issue #266 (opened 2026-10-21, Compact toolchain 0.31.1 / language ~0.23, also checked on 0.35.0) reports two points about return values:

1. Returning a value (with or without `disclose()`) reaches the calling DApp via `callTx.private.result` but is **not** present in the published transaction bytes. A ledger write of a disclosed value is present; a pure `assert` is not.
2. Returning a circuit argument compiles without `disclose()` (the caller already knows its own arguments). Returning a witness value is rejected unless wrapped in `disclose()`.

Official language (privacy-first page):

> A value leaves the circuit when it crosses a boundary: a ledger write, a return from an exported circuit, or a contract-to-contract call. A ledger write makes the value public. A return value goes to your DApp or to a calling contract. It is not written to the ledger or readable in the transaction, which carries only a randomized commitment to the call's inputs and outputs.

Official language (writing a contract, Confidentiality):

> One exception is that data contained within the arguments to an exported circuit is not considered disclosed when it is returned from that circuit, because it is necessarily already known to the caller.

`disclose()` itself does not publish a value. It clears the compiler's private-data check so the value may leave the circuit (ledger write, return, or contract-to-contract call). Ledger writes are visible on-chain; returns are not.

Lab sample: `contracts/hello-midnight/return-value-disclosure.compact` shows `return x` on an argument (accepted), `return disclose(secret())` on a witness (required), and a disclosed ledger write.

`packages/preprod-hello-stub/src/return-value-disclosure-invariant.mjs` is a source check only. It does not compile Compact, does not call proof-server 8.1.0, and does not claim a Preprod deploy or a fix of the public indexer or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
