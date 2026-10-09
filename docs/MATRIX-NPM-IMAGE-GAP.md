# Support-matrix JSON still omits npm package names and an indexer image tag

Upstream: [midnightntwrk/midnight-docs#1494](https://github.com/midnightntwrk/midnight-docs/issues/1494)

The HTML compatibility matrix is the version list this lab trusts. Read on 2026-10-09, Preview / Preprod / Mainnet list Compact toolchain 0.31.1, Midnight.js 4.1.1, DApp Connector API 4.0.1, and proof server 8.1.0:

https://docs.midnight.network/relnotes/support-matrix

Issue 1494 says `docs/relnotes/support-matrix.json` still cannot drive a version check. After the tag, github, and container mismatches already classified in `support-matrix-pins.mjs`, these fields remain:

- Package rows have no `npmPackage`. The issue asks for names such as `@midnight-ntwrk/compact-runtime` so a script can map a row to an installed package.
- `midnightntwrk/compact-devtools` is named for the devtools, toolchain, runtime, and Compact JS rows, and the issue says that repo is not public.
- Indexer `container` / tag `4.3.302` does not match an `midnightntwrk/indexer-standalone:4.3.302` image. The issue says tag `4.3.3` exists. The HTML Preprod indexer version is still 4.3.302. This lab does not change a public indexer.
- Preview node row uses `node-1.0.300`. The issue says preview RPC reported `system_version` `1.0.400-c338b9ac`. This lab does not query or fix a public node.
- Wallet SDK `latest` on npm was 1.1.0 when the issue was filed (`midnightntwrk/midnight-wallet#791`). The HTML matrix lists Wallet SDK 1.2.0. Do not treat `latest` as the matrix pin.

`packages/preprod-hello-stub/src/matrix-npm-image-gap.mjs` classifies a pasted row. It does not call GitHub, npm, Docker Hub, an indexer, or a node, and it does not invent an API.

Pins used by this lab: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Also read this run: servicedesk#236 (deploy errors that hide a runtime mismatch), servicedesk#225 (RPC 1010 wrapped as a generic submission error), example-hello-world#41 (unused axios / testcontainers). None of those are fixed here.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
