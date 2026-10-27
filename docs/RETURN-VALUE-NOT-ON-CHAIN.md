# Exported-circuit return values are not in the published transaction

Upstream: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official:

- https://docs.midnight.network/guides/security-best-practices
- https://docs.midnight.network/compact/reference/writing
- https://docs.midnight.network/compact/reference/explicit-disclosure

Issue #266 (opened 2026-10-21, Compact toolchain 0.31.1 / language ~0.23, also checked on 0.35.0) reports two related points that the explicit-disclosure page does not spell out clearly:

1. A value returned from an exported circuit (whether a witness result wrapped in `disclose()` or a circuit argument) reaches the calling DApp (`callTx.private.result`) but is **not** present in the published transaction bytes fetched from the indexer. Only a randomized commitment to the call’s inputs and outputs is on-chain.

2. Returning a circuit argument does **not** require `disclose()`. The compiler accepts `return x;` and `return a + b;`. Returning a witness value without `disclose()` is rejected.

These match the official docs:

From [Security and best practices](https://docs.midnight.network/guides/security-best-practices):

> The return value of an exported circuit | No, the transaction carries only a randomized commitment to the call's inputs and outputs.
>
> A return value is not written to the ledger or readable in the transaction; only a randomized commitment to the call's inputs and outputs is.
>
> The compiler still requires `disclose()` to return a value that comes from a witness function, because the value leaves the circuit, to your DApp or to a calling contract.
>
> Wrapping a value in `disclose()` does not publish it. `disclose()` clears the compiler's private-data check so the value may leave the circuit through a ledger write, a return from an exported circuit, or a contract-to-contract call. A ledger write is visible on-chain. A return value is not written to the ledger or readable in the transaction.

From [Writing a contract](https://docs.midnight.network/compact/reference/writing):

> One exception is that data contained within the arguments to an exported circuit is not considered disclosed when it is returned from that circuit, because it is necessarily already known to the caller.

Lab sample: `contracts/hello-midnight/return-value-disclose.compact` shows both forms. `packages/preprod-hello-stub/src/return-value-disclose-invariant.mjs` is a source check only. It does not compile Compact, does not call proof-server 8.1.0, and does not claim a Preprod deploy or a fix of the public indexer or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
