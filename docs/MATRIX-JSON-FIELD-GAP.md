# Support-matrix JSON fields a script cannot resolve

Upstream: [midnightntwrk/midnight-docs#1494](https://github.com/midnightntwrk/midnight-docs/issues/1494)

Official HTML matrix to trust for lab pins: https://docs.midnight.network/relnotes/support-matrix

JSON named by the issue: https://github.com/midnightntwrk/midnight-docs/blob/main/docs/relnotes/support-matrix.json

Issue #1494 (checked by the reporter on 2026-10-05) says most `tag`, `github`, and `container` fields cannot be used as real release coordinates. A later read of that JSON (blob `0078894976`, 2026-10-08) still shows builder-facing disagreements with the HTML matrix:

- Mainnet node `tag` is `node-1.0.400` and `containerTag` is `node-1.0.300`. The HTML matrix lists Mainnet node **1.0.400**.
- Preprod node `containerTag` is `node-1.0.400`. The published node image tag shape on the node 1.0.400 release is the bare version, not a `node-` prefix.
- Proof server `tag` is `ledger-8.1.0`. The HTML matrix and the install page name proof server **8.1.0** (`midnightntwrk/proof-server:8.1.0`).
- Wallet SDK `tag` is `@midnightntwrk/wallet-sdk@1.2.0`, an npm spec, not a git tag.
- Preprod indexer `tag` is `midnight-indexer-4.3.302`. Issue #1494 says the indexer repo uses a `v`-prefixed tag and that image `4.3.302` was not found.

This lab does not republish the matrix and does not fix the public indexer or node. Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. `packages/preprod-hello-stub/src/matrix-json-field-gap.mjs` classifies pasted rows only.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
