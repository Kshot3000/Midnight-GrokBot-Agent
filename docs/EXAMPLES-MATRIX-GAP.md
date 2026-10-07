# Examples coverage matrix is still the flat table

Upstream: [midnightntwrk/midnight-docs#1163](https://github.com/midnightntwrk/midnight-docs/issues/1163)

Official page read 2026-10-07: https://docs.midnight.network/examples

Issue #1163 asks the examples matrix to match the tutorials matrix design:

- section groupings, not one flat table
- per-cell deep links (`{ level, href }`), not string-only marks
- stretch layout on `docs/examples/index.mdx`
- missing columns: Leaderboard (page exists, no column) and Private party (absent)

The published page is still a single table. Columns on that page:

| Column | Path on the docs site |
| --- | --- |
| Calculator | `/examples/contracts/calculator` |
| Token transfers | `/examples/contracts/token-transfers` |
| Private guest list | `/examples/contracts/private-guest-list` |
| Election | `/examples/contracts/election` |
| Private reserve auction | `/examples/contracts/private-reserve-auction` |
| Battleship | `/examples/contracts/battleship-simple` |
| Bulletin board | `/examples/dapps/bboard` |
| ZK Loan | `/examples/dapps/zkloan` |

Leaderboard and Private party are not columns. The page says coverage data lives in `src/components/CoverageMatrix/data.jsx`. This lab does not edit that file and does not claim the matrix was upgraded.

`packages/preprod-hello-stub/src/examples-matrix-gap.mjs` checks that snapshot. It does not call the public indexer, node, or proof server. The hello counter in this repo is not those missing examples.

Also read this run, not fixed here: [midnightntwrk/example-hello-world#41](https://github.com/midnightntwrk/example-hello-world/issues/41) (unused axios and testcontainers; already noted in `docs/HELLO-WORLD-UNUSED-DEPS.md`) and the renovate dashboard [#13](https://github.com/midnightntwrk/example-hello-world/issues/13).

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This note does not fix the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
