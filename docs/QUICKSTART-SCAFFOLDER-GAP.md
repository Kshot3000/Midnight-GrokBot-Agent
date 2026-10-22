# Quickstart page still describes create-mn-app

Upstream: [midnightntwrk/midnight-docs#1587](https://github.com/midnightntwrk/midnight-docs/issues/1587)

Official:

- https://docs.midnight.network/getting-started/quickstart
- https://docs.midnight.network/getting-started/hello-world
- https://docs.midnight.network/relnotes/support-matrix

Issue #1587 (opened 2026-10-21) asks to rewrite `docs/getting-started/quickstart.mdx` so it documents the new scaffolder built from the `midnight-examples` monorepo, not `create-mn-app` 0.5.x. The page URL stays the same. The rewrite is blocked on https://github.com/midnightntwrk/midnight-examples/issues/59 until the new tool is published to npm.

Current public quickstart (as of the issue) describes `create-mn-app` prompts (Contract / Full DApp), the `bboard` default, `npm run setup -- --network`, and `npm run cli`. Hello-world instead clones `example-hello-world` directly.

This lab note does not invent a scaffolder API, does not claim the public docs site is updated, and does not replace the upstream rewrite. Builders on the pinned stack (Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0) should follow the hello-world path or wait for the new scaffolder README rather than copy the old `create-mn-app` steps.

Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
