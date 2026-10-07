# Sealed organizer is constructor-only

Upstream: [midnightntwrk/midnight-docs#902](https://github.com/midnightntwrk/midnight-docs/issues/902)

Issue #902 tracks the missing `ownPublicKey()` warning on auto-synced Compact reference pages. The security guide already says not to use it as caller verification. The election sample shows the matching ledger rule.

Official reads:

- https://docs.midnight.network/examples/contracts/election — `pragma language_version 0.23`. Comment in the sample: sealed ledger values cannot be changed after constructor execution. `export sealed ledger organizer` is assigned only in the constructor. Circuits compare it to a hash of a witness secret. The sample does not call `ownPublicKey()`.
- https://docs.midnight.network/compact/smart-contract-security — do not use `ownPublicKey()` to verify the caller. It is a witness.
- https://docs.midnight.network/guides/security-best-practices — `assert(ownPublicKey().bytes == owner)` compares two prover-controlled values.

Lab files:

- `contracts/hello-midnight/sealed-organizer.compact` sets `organizer` once in the constructor with `disclose` of a domain-separated hash, then `openRound` asserts equality. It does not assign the sealed field again and does not call `ownPublicKey()`.
- `packages/preprod-hello-stub/src/sealed-organizer-invariant.mjs` is a source check. `npm test` in that package covers it.

LOCAL-TRUE. Not compiled here. Not a Preprod deploy. This note does not edit midnight-docs, and it does not fix the public indexer or node.

Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
