# Quickstart still documents create-mn-app; rewrite to midnight-examples is pending

Upstream: [midnightntwrk/midnight-docs#1587](https://github.com/midnightntwrk/midnight-docs/issues/1587)

The published Quickstart at https://docs.midnight.network/getting-started/quickstart currently scaffolds with `npx create-mn-app`. Issue #1587 asks to rewrite that page (and related mentions) to the new scaffolder from the midnight-examples monorepo once https://github.com/midnightntwrk/midnight-examples/issues/59 is done and the tool is on npm.

Until that lands, builders on the supported stack should stay with the documented flow and the compatibility matrix pins:

```bash
compact update 0.31.1
npm install @midnight-ntwrk/compact-runtime@0.16.0
```

Do not switch to an unreleased scaffolder or invent CLI flags. This lab does not claim a fix of the public docs site, indexer, or node.

Official:

- https://docs.midnight.network/getting-started/quickstart
- https://docs.midnight.network/relnotes/support-matrix
- https://docs.midnight.network/how-to/fix-version-mismatches

Pins used by this lab: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Also read this run: servicedesk#264 (stagenet validator-04 stalled; not a public node fix), servicedesk#254 (faucet amount unit), midnight-docs#1579 (bboard guides rewrite), example-hello-world#41 (unused deps). None of those are fixed here.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
