# JS runtime and deploy guides still built on example-bboard

Upstream: [midnightntwrk/midnight-docs#1579](https://github.com/midnightntwrk/midnight-docs/issues/1579)

`midnightntwrk/example-bboard` is planned for archival. The bulletin board tutorial retirement is tracked separately (see `docs/BBOARD-TUTORIAL-RETIREMENT.md` and midnight-docs#1577). Two published guides still use the bulletin board contract as their worked example from start to finish and still link to the repo:

- [Using Compact contracts from JavaScript](https://docs.midnight.network/guides/compact-javascript-runtime) — compile step, imports from `./managed/bboard/contract/index.js`, `BBoardPrivateState`, `localSecretKey` witnesses, and the unit-test suite are written against `bboard.compact`.
- [Deploy and operate a contract](https://docs.midnight.network/guides/deploy-and-operate) — provider types (`BBoardProviders`, `'post' | 'takeDown'`), store names, `NodeZkConfigProvider` paths, the `BBoardWalletProvider` class, and the deploy/call scripts are bboard-specific.

Official pages checked 2026-10-21 still contain those links and samples. The issue proposes picking a maintained replacement (for example one from the midnight-examples learning path) and rewriting both guides so that `grep` for `example-bboard` or `bboard` in those two files finds nothing.

This lab does not edit midnight-docs, does not claim the public pages are rewritten, does not invent a new API or scaffolder, and does not claim a fix of the public indexer or node. Pins remain Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Official docs only: https://docs.midnight.network/.

Until the rewrite lands, treat the bulletin-board samples as historical examples. Prefer the current hello-world path and the support matrix for new work:

- https://docs.midnight.network/getting-started/hello-world
- https://docs.midnight.network/relnotes/support-matrix
- https://docs.midnight.network/guides/compact-javascript-runtime (note the bboard dependency)
- https://docs.midnight.network/guides/deploy-and-operate (note the bboard dependency)

Also read this run: servicedesk#264 (stagenet validator-04 stalled — not a public node fix claimed here), servicedesk#254 (faucet amount unit), midnight-docs#1587 (quickstart scaffolder), example-hello-world#41 (unused deps). None of those are fixed in this commit.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
