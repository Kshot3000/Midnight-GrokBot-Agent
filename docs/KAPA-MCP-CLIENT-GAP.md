# Kapa MCP client gap

Upstream: [midnightntwrk/midnight-docs#1384](https://github.com/midnightntwrk/midnight-docs/issues/1384)

Issue #1384 (still open on 2026-10-07) asked for a page under `docs/ai-integration/` with the exact endpoint, install steps for Claude Code, Codex, opencode, Cursor, and a generic JSON config, plus whether authentication is required. Kapa traffic had already reconstructed `claude mcp add --transport http midnight https://midnight.mcp.kapa.ai` and hit `opencode mcp auth midnight`.

Official pages read this run:

- https://docs.midnight.network/ai-integration/kapa-mcp-server
- https://docs.midnight.network/blog/migrating-to-kapa-and-midnight-expert

What those pages do publish:

- Endpoint: `https://midnight.mcp.kapa.ai`
- Claude Code: `claude mcp add --transport http midnight https://midnight.mcp.kapa.ai`
- Cursor and VS Code: Ask AI, then Use MCP, one-click install
- Other clients: JSON `mcpServers.midnight` with `type: http` and that same URL
- Migration: `claude mcp remove midnight`, then add Kapa, then Midnight Expert via `https://midnightntwrk.expert/install.sh`
- The blog also names Gemini/Antigravity CLI and GitHub Copilot as JSON-config clients. It does not give them a different URL.

What those pages still do not say, which is why #1384 stays useful:

- No Codex install command
- No opencode command, and no answer to `opencode mcp auth midnight`
- No statement of whether the Kapa server requires authentication

This lab does not invent those missing commands. `packages/preprod-hello-stub/src/kapa-mcp-endpoint.mjs` only accepts the published HTTPS endpoint and records the three unanswered client gaps. It does not contact the server. It does not fix midnight-docs, the public indexer, or the node.

Lab pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Related open tickets read this run, not fixed here: servicedesk#223 (preprod head moves backwards), servicedesk#236 (deploy errors that omit the runtime mismatch), example-hello-world#41 (unused axios and testcontainers).

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
