# Compact runtime API reference is on 0.20.0 while networks run 0.16.0

Upstream: [midnightntwrk/midnight-docs#1564](https://github.com/midnightntwrk/midnight-docs/issues/1564)

The Compact runtime API reference at https://docs.midnight.network/api-reference/compact-runtime/ documents `@midnight-ntwrk/compact-runtime` v0.20.0 (ledger 9 line). The official support matrix at https://docs.midnight.network/relnotes/support-matrix pairs Preview, Preprod, and Mainnet (all ledger 8) with Compact toolchain 0.31.1 and Compact runtime 0.16.0. Runtimes 0.19.0 and 0.20.0 are listed under known incompatible combinations.

Functions that appear in the 0.20.0 reference but are absent from 0.16.0 (for example `jubjubSchnorrSign`, `jubjubSchnorrVerifyingKey`, `sampleJubjubSchnorrSk`) cause TypeScript errors on the supported stack: "has no exported member".

Stay on the matrix:

```bash
compact update 0.31.1
npm install @midnight-ntwrk/compact-runtime@0.16.0
```

Do not import from a 0.20.0 reference when the project pins 0.16.0. This lab does not invent APIs and does not claim a fix of the public docs site, indexer, or node.

Official:

- https://docs.midnight.network/api-reference/compact-runtime/
- https://docs.midnight.network/relnotes/support-matrix
- https://docs.midnight.network/how-to/fix-version-mismatches

Pins used by this lab: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Also read this run: servicedesk#257 (mainnet deploys pending until TTL; not a public node fix), servicedesk#254 (faucet amount unit), midnight-docs#1561 (release notes descriptions), example-hello-world#41 (unused deps). None of those are fixed here.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
