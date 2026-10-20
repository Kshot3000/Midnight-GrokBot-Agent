# Safe Compact standard library: commit vs hash disclosure

Official: https://docs.midnight.network/compact/reference/explicit-disclosure#safe-compact-standard-library-routines

The Compact compiler's witness protection program treats some standard library routines as sufficiently disguising witness data, so `disclose()` is not required on their results. The commitment functions `transientCommit` and `persistentCommit` are recognized this way, on the assumption that their `rand` argument is sufficiently random.

Hash functions are not: `transientHash`, `persistentHash`, `keccak256`, and `sha512` propagate the witness data of their inputs. Storing or returning their result without `disclose()` is rejected, and the compiler reports it as exposure of a hash of the witness data rather than of the witness data itself.

This lab ships a source-only Compact sample that stores a commitment without `disclose` and stores a hash only after `disclose`. It does not compile here, does not invent APIs, and does not claim a fix of the public indexer, node, or proof server.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Also read this run (not fixed here): servicedesk#264 (Stagenet validator-04 stall), midnight-docs#1564 (runtime API reference version), example-hello-world#41 (unused axios/testcontainers).

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
