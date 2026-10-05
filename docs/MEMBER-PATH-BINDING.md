# Group membership path must be bound to the caller

Upstream: [midnightntwrk/midnight-docs#902](https://github.com/midnightntwrk/midnight-docs/issues/902)

Auto-synced Compact reference pages still do not warn that `ownPublicKey()` is a witness the prover controls. The official security guide already has the group procedure this lab copies: https://docs.midnight.network/guides/security-best-practices (Restricting a circuit to a group).

`contracts/hello-midnight/member-path.compact` stores commitments in `HistoricMerkleTree<10, Bytes<32>>`, inserts only through `disclose()`, checks `members.checkRoot(disclose(merkleTreePathRoot...))`, and asserts `path.leaf == derivePublicKey(secretKey())`. That binding is the line the guide calls security-critical. Without it, a path observed on a public transaction can be replayed.

This is not a substitute for `kernel.caller`. [servicedesk#202](https://github.com/midnightntwrk/servicedesk/issues/202) reports that callee contracts cannot read their caller. The checker rejects `kernel.caller` so the lab does not invent that API.

`packages/preprod-hello-stub/src/member-path-invariant.mjs` is a source check only. It does not compile Compact, does not call the proof server, and does not claim a Preprod deploy. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This lab note does not fix the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
