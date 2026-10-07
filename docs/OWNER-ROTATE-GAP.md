# Owner rotation still needs the derived-identity warning

Upstream: [midnightntwrk/midnight-docs#902](https://github.com/midnightntwrk/midnight-docs/issues/902)

Official procedure: https://docs.midnight.network/guides/security-best-practices (Rotating an owner key)

`ownPublicKey()` is a witness. A circuit that does `assert(ownPublicKey().bytes == owner)` compares two prover-controlled values. The protocol does not check that value against the wallet that signed the transaction. Issue #902 asks for that warning on the auto-synced stdlib and compact-runtime pages. Those pages are regenerated; this lab file does not edit them.

The same guide's rotation circuit re-derives the commitment, asserts it matches `owner`, then writes `disclose(newOwner)`. The incoming holder generates the secret locally and shares only the derived public value.

Lab contract: `contracts/hello-midnight/owner-rotate.compact`

- Identity is `persistentHash` of a domain separator and `secretKey()`, then `disclose()` on the ledger write.
- `claimOwnership` asserts the owner slot is empty before the first write.
- Extra invariant the official snippet does not assert: `rotateOwner` refuses an empty `newOwner` and refuses a no-op that writes the current commitment again.
- Compact pin in this repo: language `>= 0.23`, compiler about `0.31.1`. Not compiled in this change. Not deployed. Not a node or indexer fix.

Checker: `packages/preprod-hello-stub/src/owner-rotate-invariant.mjs` (`npm run check:owner-rotate` in that package).

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
