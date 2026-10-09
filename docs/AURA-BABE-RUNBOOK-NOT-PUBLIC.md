# Aura→BABE runbook is not public docs yet (lab)

Upstream: [midnightntwrk/midnight-docs#1092](https://github.com/midnightntwrk/midnight-docs/issues/1092)

Read 2026-10-09. The issue is still open, still labeled BLOCKED, and still says public-facing docs should change only after the Aura→BABE migration on mainnet. A comment the same day points at an operator runbook delivered with midnight-node#2113:

https://github.com/midnightntwrk/midnight-node/blob/e1efdccc1c2f065772620f51dfec26d2aaf54dab/docs/aura-to-babe-migration-runbook.md

That file is in the node repository. It is not a page on https://docs.midnight.network/. Official pages checked the same day still describe block production as AURA and finality as GRANDPA:

- https://docs.midnight.network/concepts/network-architecture/consensus
- https://docs.midnight.network/nodes
- https://docs.midnight.network/relnotes/support-matrix (Preprod and Mainnet node 1.0.400; no BABE row)

This lab note does not copy the runbook, does not invent a BABE Compact circuit or midnight-js call, and does not claim the public node or indexer was fixed. Contract pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Consensus key choice is a node-operator concern, not a prove path.

`packages/preprod-hello-stub/src/aura-babe-runbook-gate.mjs` rejects a local note that treats the node-repo runbook as current public docs, or that tells a Compact builder to mint BABE keys while the official pages still name AURA.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
