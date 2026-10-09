# Assert the Boolean from Compact verify circuits

Upstream: [midnightntwrk/midnight-docs#1387](https://github.com/midnightntwrk/midnight-docs/issues/1387)

That issue tracks Compact reference gaps from the Kapa review. The docs repo handed the remaining items to LFDT-Minokawa/compact#833 because the pages are copied from the Compact repo. One sentence already on the official exports page is easy to miss: the verify circuits return a Boolean. They do not reject a bad signature unless the circuit asserts that Boolean.

Official: https://docs.midnight.network/compact/standard-library/exports

Checked there on 2026-10-09:

- `ed25519Verify` returns true if the signature is valid and false otherwise. It asserts only that the key is not the identity `Curve25519Point`. Ed25519ctx and Ed25519ph do not verify.
- `secp256r1EcdsaVerify` and `secp256k1EcdsaVerify` return true or false and take `msgHash` as given. They do not bind the hash to a message.
- `jubjubSchnorrVerify` returns true or false and asserts only that the key is not the identity `JubjubPoint`.
- Each of those sections says: to enforce a valid signature, `assert` that the result is true.

`contracts/hello-midnight/assert-verify.compact` asserts `ed25519Verify` and `secp256r1EcdsaVerify`. `packages/preprod-hello-stub/src/assert-verify-invariant.mjs` scans source the caller already has. It does not compile Compact, does not call midnight-js, and does not claim a fix of the public indexer or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Also read this run: servicedesk#236 (ContractMaintenanceAuthority still unnamed on midnight-js 4.1.1), servicedesk#225 (RPC 1010 wrapped as a generic submission error), midnight-docs#1509 (unsigned 1010 causes and code-less TransactionInvalidError), example-hello-world#41 (unused axios / testcontainers). None of those are fixed here.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
