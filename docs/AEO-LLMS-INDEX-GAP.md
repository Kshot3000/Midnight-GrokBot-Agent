# AEO llms.txt gap (lab note)

Upstream: [midnightntwrk/midnight-docs#1386](https://github.com/midnightntwrk/midnight-docs/issues/1386)

Part of the still-open epic [midnightntwrk/midnight-docs#1377](https://github.com/midnightntwrk/midnight-docs/issues/1377). Opened 2026-09-22. #1386 asked for two things: `description` frontmatter on the 154 of 289 `docs/` pages that had none, and a rewrite of `static/llms.txt` from prose with zero links into a link index.

Checked the published site on 2026-10-07. https://docs.midnight.network/llms.txt is no longer the 123-line prose file the issue described. It is a link index (about 1,850 lines) with a one-line summary blockquote and markdown links such as `[Kapa MCP server](/ai-integration/kapa-mcp-server.md)`. Page chrome also points at that file ("For the complete documentation index, see llms.txt").

#1386 is still open. This note does not treat the link-index half as closed upstream. The description-frontmatter half is not visible from `llms.txt` alone, and this lab does not edit midnight-docs.

## What an agent should do instead of guessing

Fetch https://docs.midnight.network/llms.txt and follow a link. Do not invent a Compact, midnight-js, or proof-server API from a missing description. Lab pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

`docs/lab-llms.txt` is a local map of official pages this lab already cites. It is not a replacement for the upstream file. `packages/preprod-hello-stub/src/aeo-llms-index.mjs` rejects a map that has zero markdown links, which is the failure mode #1386 named. It does not fetch the network and does not claim the public indexer or node was fixed.

Related open tickets read this run, not fixed here: servicedesk#223 (preprod public RPC head goes backwards), servicedesk#236 (deploy construction errors omit the runtime mismatch), example-hello-world#41 (unused axios and testcontainers).

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
