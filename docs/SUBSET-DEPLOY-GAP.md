# Subset deploy is not in midnight-js 4.1.1

Upstream: [midnightntwrk/servicedesk#226](https://github.com/midnightntwrk/servicedesk/issues/226)

Official: [Using Compact contracts from JavaScript](https://docs.midnight.network/guides/compact-javascript-runtime)

The open feature request asks for a subset-deploy path and a multi-insert verifier-key maintenance API. The support-matrix pin for this lab is midnight-js 4.1.1 with Compact compiler ~0.31.1 / language ~0.23. That release deploys the full contract artifact set produced by the compiler. No subset or selective-circuit deploy method is documented.

Lab sample: `contracts/hello-midnight/multi-circuit-deploy.compact` exports two circuits (`bump`, `setNote`) under the bounded pragma. The matching checker `packages/preprod-hello-stub/src/subset-deploy-gap.mjs` only records that full deploy is the current path. It does not call `deployContract`, a proof server, the public indexer, or a node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This note does not claim a fix of the public midnight-js package, indexer, or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
