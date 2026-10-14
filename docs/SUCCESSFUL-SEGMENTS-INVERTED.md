# TransactionResult.successfulSegments is inverted on ledger 9

Upstream: [midnightntwrk/servicedesk#186](https://github.com/midnightntwrk/servicedesk/issues/186)

Official API (ledger v8.1.2 page): https://docs.midnight.network/api-reference/ledger/classes/TransactionResult

`successfulSegments` is an optional `Map<number, boolean>` present on `partialSuccess`. The field name says `true` means the segment applied.

On ledger 9 (`@midnightntwrk/ledger-v9@1.0.0-rc.3`, the Stagenet pin reported in the issue) the map is built with `v.is_err()` instead of `v.is_ok()`. Every boolean is inverted: `true` marks the segments whose maintenance update FAILED, `false` marks the ones that APPLIED. The same line appears in an 8.2.0-rc.1 source. The public networks use earlier ledger pins; this lab does not claim the inversion is live on Preprod or Mainnet.

A caller that treats `successfulSegments.get(seg) === true` as "my change landed" is wrong in both directions on the affected builds. The map exists only on `partialSuccess`; it is `undefined` on both `success` and `failure`.

This lab does not patch the ledger, the node, or the public indexer. It only ships a local decoder so a builder can flag the known inversion when the map looks inverted relative to ground truth, or simply warn that the boolean cannot be trusted on ledger 9.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Official docs only.

This does not claim a fix of the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
