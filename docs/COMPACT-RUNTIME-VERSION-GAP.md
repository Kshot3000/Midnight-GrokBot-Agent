# Compact runtime API version gap

Upstream: [midnightntwrk/midnight-docs#1564](https://github.com/midnightntwrk/midnight-docs/issues/1564)

Official: [Compatibility matrix](https://docs.midnight.network/relnotes/support-matrix) · [Compact runtime API](https://docs.midnight.network/api-reference/compact-runtime)

The support matrix pairs Preview, Preprod, and Mainnet with Compact toolchain **0.31.1** and Compact runtime **0.16.0**. The Compact runtime API reference page currently documents **@midnight-ntwrk/compact-runtime v0.20.0**.

That 0.20.0 reference is for the ledger 9 line. The matrix states that Compact runtimes 0.19.0 and 0.20.0 (and toolchains 0.34.0 / 0.35.0) do not work with the ledger 8 networks. Midnight.js 4.1.1 pins compact-runtime to 0.16.0. Importing a contract compiled for 0.16.0 into a 0.19/0.20 runtime (or the reverse) produces a version-mismatch error. Deploying a ledger-9 contract to these networks fails because ledger 8 cannot read the initial state.

This lab does not edit midnight-docs or the public API reference. `packages/preprod-hello-stub/src/compact-runtime-version-gap.mjs` only reports the pinned versions from the matrix and flags a mismatch against the published API page. It does not call the compiler, midnight-js, or a proof server, and it does not claim the public docs site is fixed.

Pins used by this lab: Compact ~0.31.1 / language >= 0.23, compact-runtime 0.16.0, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Builder advice (from the matrix, do not invent APIs):

- Stay on `compact update 0.31.1` and `npm install @midnight-ntwrk/compact-runtime@0.16.0`.
- A bare `compact update` or unpinned `npm install @midnight-ntwrk/compact-runtime` pulls the newest (ledger 9) line.
- Functions present only on 0.19.0/0.20.0 (for example certain Schnorr helpers mentioned in the issue) are not available on the network-supported runtime.

This does not fix the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
