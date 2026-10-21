# Quickstart page still documents create-mn-app 0.5.x

Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1587

Official: https://docs.midnight.network/getting-started/quickstart

midnight-docs#1587 asks to rewrite `docs/getting-started/quickstart.mdx` so it documents the new scaffolder built from the `midnight-examples` monorepo, not `create-mn-app` 0.5.x. The URL, file and sidebar entry stay the same. The issue is blocked on https://github.com/midnightntwrk/midnight-examples/issues/59 until the new tool is published to npm.

The live page (checked 2026-10-21) still opens with:

> This guide explains how to scaffold a Midnight DApp using the `create-mn-app` CLI tool.

It shows `npx create-mn-app [project-name]`, prompts for Contract / Full DApp, lists templates `hello-world`, `battleship`, `bboard`, `leaderboard`, and describes `npm run setup -- --network` for public testnets. The Compact sample uses `pragma language_version >= 0.23;` and `Opaque<"string">`.

This lab note does not invent APIs, does not claim a fix to the public docs or the scaffolder, and does not push to midnightntwrk. It only records the published wording and the open rewrite so builders on the pinned stack (Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1) can see the current official path while the issue is open.

## Official pins

From the support matrix (https://docs.midnight.network/relnotes/support-matrix):

- Compact toolchain 0.31.1
- Compact runtime 0.16.0
- Midnight.js 4.1.1
- DApp Connector API 4.0.1
- Proof server 8.1.x (lab tracks 8.1.0)

## Lab helper

`packages/preprod-hello-stub/src/quickstart-create-mn-app-gap.mjs` classifies a page snippet for the presence of `create-mn-app` versus a new-scaffolder marker. It does not fetch the live page and does not call npm. LOCAL-TRUE.

Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
