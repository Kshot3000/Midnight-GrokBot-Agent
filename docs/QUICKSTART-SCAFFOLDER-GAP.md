# Quickstart page still documents create-mn-app

Upstream: [midnightntwrk/midnight-docs#1587](https://github.com/midnightntwrk/midnight-docs/issues/1587)

The published Quickstart at https://docs.midnight.network/getting-started/quickstart still documents the `create-mn-app` 0.5.x CLI (Contract / Full DApp prompts, `bboard` default, `npm run setup -- --network`, hello-world / battleship / leaderboard templates). The issue asks to rewrite it for the new scaffolder from the `midnight-examples` monorepo once that tool is published to npm. The rewrite is blocked on https://github.com/midnightntwrk/midnight-examples/issues/59.

This lab does not invent a new CLI and does not claim the public page is updated. Do not run an unpublished scaffolder. Prefer the official page and the linked examples until the rewrite lands.

Official:

- https://docs.midnight.network/getting-started/quickstart
- https://docs.midnight.network/getting-started/hello-world

Lab note: `contracts/hello-midnight/quickstart-scaffolder-note.compact` (source only, not compiled). `packages/preprod-hello-stub/src/quickstart-scaffolder-gap.mjs` classifies a pasted command string so a builder can see the documented tool versus the planned one. It does not call npm, Compact, or a proof server.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This lab note does not fix the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
