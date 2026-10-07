# AURA still documented; BABE update is open (lab)

Official Midnight docs, checked 2026-10-07, still describe block production as AURA and finality as GRANDPA. They do not document BABE session keys.

Sources:

- https://docs.midnight.network/concepts/network-architecture/consensus — table row and section "AURA: Block production"; FAQ still says AURA for block production and GRANDPA for finality.
- https://docs.midnight.network/nodes — architecture diagram labels consensus "AURA / GRANDPA"; signature schemes say Sr25519 is AURA block authorship signing.

Upstream: [midnightntwrk/midnight-docs#1092](https://github.com/midnightntwrk/midnight-docs/issues/1092) tracks the Aura-to-BABE docs update (dual-engine coexistence, BABE key registration). That issue is open. This lab file is not a docs.midnight.network edit and does not claim the migration has shipped.

Builder check: `packages/preprod-hello-stub/src/aura-babe-doc-gap.mjs`. It flags a local note that tells operators to mint BABE keys or drop AURA keys while the official pages above still name AURA. It does not call RPC, does not change a node, and does not invent a BABE Compact or midnight-js API.

Pins for this repo stay Compact about 0.31.1 / language about 0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Consensus key choice is a node concern, not a Compact circuit.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
