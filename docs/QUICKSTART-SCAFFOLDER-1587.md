# Quickstart Page Still Documents create-mn-app (pending scaffolder)

This note records the open documentation task so builders know the current Quickstart page is scheduled for replacement and can avoid conflicting setup instructions.

**Upstream issue:** [midnightntwrk/midnight-docs#1587](https://github.com/midnightntwrk/midnight-docs/issues/1587) — Replace the Quickstart page's `create-mn-app` content with the new `midnight-examples` scaffolder.

Blocked on [midnightntwrk/midnight-examples#59](https://github.com/midnightntwrk/midnight-examples/issues/59). The rewrite should start only after the new tool is published to npm, and should be written from its README and from commands that have actually been run.

## Current page

https://docs.midnight.network/getting-started/quickstart (source `docs/getting-started/quickstart.mdx`).

It still describes `create-mn-app` 0.5.x prompts (Contract / Full DApp), the `bboard` default, `npm run setup -- --network`, `npm run cli`, and a Counter `--from` note.

## Planned changes (from the issue)

- Rewrite the body for the new scaffolder built from the `midnight-examples` monorepo.
- Templates follow the learning path: hello-world → private-bid → battleship → private-tip-jar → shielded-chips → zk-loan.
- Keep frontmatter title / sidebar_label / sidebar_position; update description.
- Update other pages that still mention `create-mn-app` (networks-and-environments.mdx, blog posts, links).
- After the change, no live page should tell readers to run `create-mn-app@0.x`.

## Related existing page

`docs/getting-started/hello-world.mdx` clones `example-hello-world` directly. The two pages should not give conflicting setup instructions once the Quickstart is rewritten.

## Pins used in this lab

- Compact ~0.31.1 / language ~0.23
- midnight-js 4.1.1
- DApp Connector 4.0.1
- proof-server 8.1.0

This lab note does not invent APIs, does not modify the upstream docs, and does not claim to fix the public indexer or node. It only collates the open task so builders know the documented Quickstart flow is in transition.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
