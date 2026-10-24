# Safe commitment functions do not require disclose()

Upstream: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official:
- https://docs.midnight.network/compact/reference/explicit-disclosure
- https://docs.midnight.network/compact/smart-contract-security

The explicit disclosure page states that the compiler recognizes certain Compact standard library routines as sufficiently disguising witness data so that explicit declaration of disclosure is not required. The commitment functions `transientCommit` and `persistentCommit` are examples, under the assumption that their `rand` argument is sufficiently random.

The smart-contract security page confirms: "The result of a `persistentCommit` operation does not require `disclose()` because the use of a random salt value allows the compiler to consider the return value as sufficiently private for storage publicly."

On Compact toolchain 0.31.1 (language 0.23) a circuit may store `persistentCommit(witness(), rand)` directly to the ledger, or return `transientCommit(witness(), rand)`, without a `disclose()` wrapper. Hash functions such as `persistentHash` do not have this property.

Lab sample: `contracts/hello-midnight/safe-commit-no-disclose.compact` shows both cases with a witness-derived value.

This lab does not claim a fix of the public docs, compiler, indexer, or node. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
