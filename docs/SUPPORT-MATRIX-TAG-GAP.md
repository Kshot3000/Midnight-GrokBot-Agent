# Support-matrix tags that do not resolve

Upstream: [midnightntwrk/midnight-docs#1494](https://github.com/midnightntwrk/midnight-docs/issues/1494)

The published compatibility matrix lists component versions. The JSON at `docs/relnotes/support-matrix.json` also has `tag`, `github`, and `container` fields. Issue 1494 says most of those fields cannot be checked out as written: Compact is tagged `compactc-v0.31.1` in `LFDT-Minokawa/compact`, midnight-js is tagged `v4.1.1`, the proof server is released from `midnightntwrk/midnight-ledger` as image `midnightntwrk/proof-server`, and the node image is `midnightntwrk/midnight-node` rather than the toolkit image. This lab does not edit that JSON and does not claim the public indexer or node is fixed.

Use the versions on https://docs.midnight.network/relnotes/support-matrix for the lab pin, not a raw `tag` string:

| Lab pin | Documented version |
| --- | --- |
| Compact toolchain | 0.31.1 |
| Compact language | ~0.23 |
| compact-runtime | 0.16.0 |
| Midnight.js | 4.1.1 |
| DApp Connector API | 4.0.1 |
| Proof server | 8.1.0 |

`packages/preprod-hello-stub/src/support-matrix-pins.mjs` classifies a copied row against the release identities recorded on issue 1494. It does not call GitHub and does not invent an API.

Pins used by this lab: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
