# Derived caller auth (lab)

Official Midnight docs say `ownPublicKey()` is a witness. A circuit that does `assert(ownPublicKey().bytes == owner)` compares two prover-controlled values. The protocol does not check that value against the wallet that signed the transaction.

Sources (do not invent a replacement API):

- https://docs.midnight.network/guides/security-best-practices
- https://docs.midnight.network/compact/smart-contract-security

Upstream: [midnightntwrk/midnight-docs#902](https://github.com/midnightntwrk/midnight-docs/issues/902). The stdlib and compact-runtime reference pages that mention `ownPublicKey()` are regenerated and still lack the warning bar. This lab file is not a fix to those pages.

Lab contract: `contracts/hello-midnight/caller-auth.compact`

- Identity is `persistentHash` of a domain separator and `secretKey()`, then `disclose()` on the ledger write.
- Extra invariant: `claimOwnership` asserts `owner == pad(32, "")` before that write, so a second claim cannot overwrite the commitment. The official snippet stores the commitment once but does not assert the empty slot.
- `withdraw` re-derives the hash and asserts it matches `owner`.
- Compact pin in this repo: language `>= 0.23`, compiler about `0.31.1`. Not compiled in this change. Not deployed. Not a node or indexer fix.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
