# Release notes pages share the same description across versions

Upstream: [midnightntwrk/midnight-docs#1561](https://github.com/midnightntwrk/midnight-docs/issues/1561)

Official release notes live under https://docs.midnight.network/relnotes/. The support matrix is the version pin builders should re-check before a deploy: https://docs.midnight.network/relnotes/support-matrix

Issue #1561 reports that 38 release-notes pages have a `description` front-matter field, but it is the component boilerplate. Every version of a component therefore shows the same text in search results and in `llms.txt`. A retrieval agent cannot tell the versions apart from the index.

Groups called out:

- Node: 11 pages (0.18.0 to 1.0.400) share “Node is a core component of the Midnight Network…”
- Midnight.js: 6 pages (3.0.0 to 4.0.4)
- Ledger: 7 pages in two groups (7.0.0 to 8.0.3, and 8.1.0 to 8.1.3)
- Compact developer tools: 4 pages (0.5.0 to 0.5.3)
- Compact JS: 3 pages (2.4.0, 2.5.0, 2.5.3)
- DApp Connector API: 2 pages (4.0.0, 4.0.1)
- Wallet: wallet-1-0-0 and wallet-sdk-1-0-0
- Examples: battleship-simple, private-guest-list, and private-reserve-auction under /examples/contracts all say “Example contract”

Suggested upstream pattern (from the issue, following #1483): “Release notes for <component> <version>, which <the one or two headline changes>”. A description line on the release-note template would stop the boilerplate being copied forward.

This lab does not push to midnightntwrk, does not invent a description API, and does not claim the public docs site is fixed. Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Lab files:

- `packages/preprod-hello-stub/src/release-notes-description-gap.mjs` — classifies a component + version against the shared-description groups reported in #1561. No network calls. Points builders at the support matrix and the individual release-note page rather than the shared index text.
- `contracts/hello-midnight/release-notes-description-note.compact` — Compact note only. No circuit. Reminds that version pins come from the support matrix, not from a shared release-note description.

Workaround until the descriptions are version-specific: open the support matrix, then open the concrete release-notes page for the pin you are using (for this lab: Compact ~0.31.1, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0). Do not rely on the search snippet or `llms.txt` description to distinguish versions.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
