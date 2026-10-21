# Quickstart still documents create-mn-app while a new scaffolder is planned

Upstream: [midnightntwrk/midnight-docs#1587](https://github.com/midnightntwrk/midnight-docs/issues/1587)

Official docs only: https://docs.midnight.network/

Issue #1587 asks to rewrite `docs/getting-started/quickstart.mdx` so it documents a new scaffolder built from the `midnight-examples` monorepo, not `create-mn-app` 0.5.x. The work is **blocked on** [midnight-examples#59](https://github.com/midnightntwrk/midnight-examples/issues/59). The instruction is to start once the new tool is published to npm, and to write from its README and from commands that have actually been run.

Checked live on 2026-10-20:

- https://docs.midnight.network/getting-started/quickstart still opens with `npx create-mn-app [project-name]`, the Contract / Full DApp prompts, `hello-world` / `battleship` / `bboard` / `leaderboard` templates, `npm run setup -- --network`, and the local docker-compose devnet.
- The same page's Compact sample uses `pragma language_version >= 0.23` and a simple `storeMessage` circuit, which matches the lab pin (Compact ~0.31.1 / language ~0.23).
- Related pages still mention `create-mn-app` (for example the networks-and-environments guide).

This lab does not invent the unpublished scaffolder command, does not edit midnight-docs, and does not claim a fix of the public quickstart. Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Until the new tool lands, builders should follow the published quickstart or clone a maintained example directly (for example `midnightntwrk/example-hello-world`).

`packages/preprod-hello-stub/src/quickstart-scaffolder-gap.mjs` classifies a `create-mn-app` command as the legacy path and refuses to treat an unpublished midnight-examples CLI as documented. LOCAL-TRUE. No network call.

Also read this run: servicedesk#264 (Stagenet validator stall), servicedesk#254 (faucet amount unit), midnight-docs#1579 (rewrite guides off bboard), example-hello-world#41 (unused deps). None of those are fixed here.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
