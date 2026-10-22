# Quickstart page still describes create-mn-app (blocked)

Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1587

The issue asks to rewrite `docs/getting-started/quickstart.mdx` so it documents the new scaffolder from the `midnight-examples` monorepo instead of `create-mn-app` 0.5.x. It is blocked on https://github.com/midnightntwrk/midnight-examples/issues/59 until the new tool is published to npm.

Official getting-started (https://docs.midnight.network/getting-started/hello-world) currently instructs cloning `midnightntwrk/example-hello-world` and using Compact toolchain 0.31.1 (`compact update 0.31.1`, `pragma language_version 0.23`). The Quickstart page still describes the older `create-mn-app` prompts, `bboard` default, and `npm run setup -- --network` flow.

This lab does not invent the new scaffolder's commands, templates, or project layout. Builders on the pinned stack should follow the published hello-world guide and the compatibility matrix until the rewrite lands. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Does not claim a fix to the public docs, indexer, or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
