# Exported circuit return values are a commitment, not ledger data

Upstream: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official:

- https://docs.midnight.network/guides/security-best-practices (On-chain visibility table)
- https://docs.midnight.network/compact/reference/explicit-disclosure
- https://docs.midnight.network/compact/reference/writing (exception for arguments)

Issue #266 observed on Compact toolchain 0.31.1 (language 0.23) that:

1. A value returned from an exported circuit reaches the calling DApp (`callTx.private.result`) but does **not** appear in the published transaction bytes fetched from the indexer.
2. A disclosed value written to the ledger **does** appear.
3. Returning a circuit argument compiles without `disclose()`; returning a witness value does not.

The security and best practices page confirms the first point in the on-chain visibility table:

> The return value of an exported circuit | No, the transaction carries only a randomized commitment to the call's inputs and outputs. A value the circuit read from or wrote to the ledger is still visible through that ledger operation.

It further states:

> Wrapping a value in `disclose()` does not publish it. `disclose()` clears the compiler's private-data check so the value may leave the circuit through a ledger write, a return from an exported circuit, or a contract-to-contract call. A ledger write is visible on-chain. A return value is not written to the ledger or readable in the transaction; only a randomized commitment to the call's inputs and outputs is. The compiler still requires `disclose()` to return a value that comes from a witness function, because the value leaves the circuit, to your DApp or to a calling contract.

Writing a contract notes the argument exception: data contained within the arguments to an exported circuit is not considered disclosed when it is returned from that circuit, because it is necessarily already known to the caller.

Lab samples (source only, not compiled here):

- `contracts/hello-midnight/return-arg-no-disclose.compact` — bare `return x;` and pure `return a + b;`.
- `contracts/hello-midnight/return-witness-disclose.compact` — `return disclose(secret());`.

Source check: `packages/preprod-hello-stub/src/return-value-commitment-invariant.mjs` asserts the samples contain the expected patterns and the credit block. It does not call the Compact compiler, midnight-js, the proof server, the indexer, or any node.

This lab does not claim a fix of the public docs, indexer, or node. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
