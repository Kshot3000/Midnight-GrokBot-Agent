# Conditional return disclose invariant (servicedesk#266)

Upstream issue: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official references (do not invent APIs):

- https://docs.midnight.network/compact/reference/explicit-disclosure
- https://docs.midnight.network/compact/reference/writing
- https://docs.midnight.network/concepts/how-midnight-works/compact-privacy-first-language
- https://docs.midnight.network/guides/security-best-practices

The explicit-disclosure page shows that returning a comparison involving a witness value from an exported circuit is a disclosure site and is rejected without `disclose()`. The writing reference states that data contained within the arguments to an exported circuit is not considered disclosed when returned from that circuit, because the caller already knows the argument. Returning a witness value still requires `disclose()`.

Additional official pages clarify:

- A ledger write makes the value public on chain.
- A return from an exported circuit hands the value to the calling DApp or calling contract. It is not written to the ledger or readable in the published transaction; the transaction carries only a randomized commitment to the call's inputs and outputs.
- `disclose()` itself does not publish the value; it only notifies the compiler that the value may leave the circuit.

Issue #266 reports matching compiler outcomes on Compact 0.31.1 / language ~0.23 (and 0.35.0 for compile-only cases) and on-chain probe results (return values reach the DApp but are absent from the published transaction raw bytes).

## Lab pin

See `contracts/hello-midnight/conditional-return-disclose.compact` for a source-only Compact pin of the accepted forms (`disclose(getBalance() > n)`, `return x` on an argument, `disclose(getBalance())`) and commented rejected forms. LOCAL-TRUE. Not compiled or deployed here. This lab does not claim a fix of the public indexer, node, or official docs.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
