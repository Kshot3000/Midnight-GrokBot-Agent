# Returning a circuit argument needs no disclose()

Upstream: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official pages:

- https://docs.midnight.network/compact/reference/explicit-disclosure
- https://docs.midnight.network/guides/security-best-practices
- https://docs.midnight.network/guides/build-a-private-smart-contract
- https://docs.midnight.network/concepts/how-midnight-works/compact-privacy-first-language

Issue #266 reports two facts confirmed against Compact toolchain 0.31.1 (language 0.23) and later:

1. **Circuit return values are not in the published transaction.**  
   `disclose()` on a return (or on a witness that is returned) tells the compiler the value may leave the circuit. It reaches the calling DApp (`callTx.private.result`) or a calling contract. It is not written into the ledger and does not appear in the transaction's `raw` bytes. The transaction carries only a randomized commitment to the call's inputs and outputs. A ledger write is the path that makes a value public on chain.

2. **Returning an exported-circuit argument needs no `disclose()`.**  
   The compiler accepts `return x;` and `return a + b;` on circuit arguments. It rejects `return secretNum();` without `disclose()`. The caller already knows its own arguments, so the witness-protection program does not treat them as undeclared disclosure when they are simply returned.

The explicit-disclosure page still says a program must declare disclosure "before storing it in the public ledger, returning it from an exported circuit, or passing it to another contract" and that "disclosure does not occur just when witness data is stored in the ledger but also when returned from an exported circuit." That wording can be read as claiming the returned value becomes public like a ledger write. Other official pages already separate the two meanings.

Lab sample: `contracts/hello-midnight/return-arg-no-disclose.compact` shows:

- `returnArg` returns its argument with no `disclose()`
- `returnWitness` returns a witness only after `disclose()`
- `storeArg` writes the argument to the ledger with `disclose()`

This lab does not claim a fix of the public docs, compiler, indexer, or node. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
