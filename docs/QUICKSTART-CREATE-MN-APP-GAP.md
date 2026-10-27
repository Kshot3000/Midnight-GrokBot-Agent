# Quickstart still documents create-mn-app (lab)

Upstream: [midnightntwrk/midnight-docs#1587](https://github.com/midnightntwrk/midnight-docs/issues/1587)

Official: https://docs.midnight.network/getting-started/quickstart

Issue #1587 tracks rewriting the Quickstart page so it documents the new scaffolder built from the `midnight-examples` monorepo, not `create-mn-app` 0.5.x. The rewrite is blocked on https://github.com/midnightntwrk/midnight-examples/issues/59 until the new tool is published to npm.

Until that lands, the published Quickstart still describes the old `create-mn-app` prompts (Contract / Full DApp), the `bboard` default, and `npm run setup -- --network`. Builders following it today get the old scaffold.

This lab does not edit midnight-docs, does not publish an npm package, and does not claim the public indexer or node is fixed. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Lab classifier (source only, no npm call): `packages/preprod-hello-stub/src/quickstart-create-mn-app-gap.mjs` (`npm run check:quickstart-create-mn-app`).

It flags snippets that still contain `create-mn-app` so a builder can see the gap before they scaffold.

Official docs remain the source of truth. Re-check the compatibility matrix and the Quickstart page before starting a new project.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
