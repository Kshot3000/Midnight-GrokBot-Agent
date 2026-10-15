# Group membership must bind the Merkle path to the caller

Upstream: [midnightntwrk/midnight-docs#1387](https://github.com/midnightntwrk/midnight-docs/issues/1387)

Compact reference pages are synced from the compiler repository and do not carry the group-access procedure. The security guide does.

Official source: https://docs.midnight.network/guides/security-best-practices

- Store member identities in a `HistoricMerkleTree`. It hides which leaf a proof refers to and accepts proofs against earlier roots.
- `act` verifies the path root with `members.checkRoot`, then asserts `path.leaf == derivePublicKey(secretKey())`.
- The binding assert is required. Without it, anyone who observed a valid path in a public transaction could replay it.
- Domain separator and language pin in the official sample are `"myapp:member"` and `pragma language_version 0.23.0`. This lab sample uses a lab separator and `>= 0.23`.
- Disclose only when a private value crosses into a public position (the insert argument).

Lab contract: `contracts/hello-midnight/group-membership.compact`

`packages/preprod-hello-stub/src/group-membership-invariant.mjs` is a source check only. It does not compile Compact, does not call proof-server 8.1.0, and does not claim a Preprod deploy. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This lab note does not fix the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
