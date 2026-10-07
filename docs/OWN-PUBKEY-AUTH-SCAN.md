# ownPublicKey is not caller verification

Upstream: [midnightntwrk/midnight-docs#902](https://github.com/midnightntwrk/midnight-docs/issues/902)

Official pages already warn that `ownPublicKey()` is a witness the prover controls:

- https://docs.midnight.network/guides/security-best-practices
- https://docs.midnight.network/compact/smart-contract-security

Issue #902 asks the auto-synced Compact reference pages to surface that warning. This lab does not edit those pages.

The bypassable form is `assert(ownPublicKey().bytes == owner)`. The official replacement derives the identity from a secret the caller must know (`persistentHash` of a domain separator and `secretKey()`), then `disclose()`s only that hash onto the ledger. `contracts/hello-midnight/caller-auth.compact` follows that pattern and also asserts the owner slot is empty before the first write.

`packages/preprod-hello-stub/src/own-pubkey-auth-scan.mjs` flags non-comment `ownPublicKey()` uses that sit in an `assert` or equality. It does not compile Compact, does not deploy, and does not fix the public indexer or node.

Also read this run: servicedesk#223 (preprod RPC head can go backwards), servicedesk#236 (deploy errors that hide a runtime mismatch), midnight-docs#1504 (hosted Preprod indexer and RPC shutdown asked for 9 Oct 2026), example-hello-world#41 (unused axios and testcontainers). None of those are fixed here.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
