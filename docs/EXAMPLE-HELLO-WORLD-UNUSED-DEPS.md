# Unused dependencies in the official hello-world example

Upstream: [midnightntwrk/example-hello-world#41](https://github.com/midnightntwrk/example-hello-world/issues/41)

Official references:

- https://docs.midnight.network/getting-started/hello-world
- https://docs.midnight.network/getting-started/installation
- https://docs.midnight.network/relnotes/support-matrix

Issue #41 reports that `axios` and `testcontainers` are declared in the example's `package.json` dependencies but are not imported or referenced in the repository (confirmed by `git grep` excluding lockfile and the declaration lines).

This lab does not modify the upstream example. Builders who clone `midnightntwrk/example-hello-world` and run `yarn install` will still pull those packages until the issue is resolved upstream. The lab pins Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, and proof-server 8.1.0, matching the compatibility matrix for current networks.

Lab helper: `packages/preprod-hello-stub/src/example-hello-unused-deps.mjs` flags a package.json string that still lists them.

Lab Compact note: `contracts/hello-midnight/example-unused-deps-note.compact` is a minimal pure circuit that does not depend on either package.

This does not claim a fix of the public example, indexer, or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
