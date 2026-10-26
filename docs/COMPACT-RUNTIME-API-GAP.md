# Compact runtime API reference documents 0.20.0 while public networks run 0.16.0

Upstream: [midnightntwrk/midnight-docs#1564](https://github.com/midnightntwrk/midnight-docs/issues/1564)

Official:

- https://docs.midnight.network/relnotes/support-matrix
- https://docs.midnight.network/api-reference/compact-runtime
- https://docs.midnight.network/relnotes/compact/toolchain-0.31.1

The support matrix (Preview, Preprod, and Mainnet) pairs Compact toolchain 0.31.1 with Compact runtime 0.16.0. It explicitly lists Compact runtime 0.19.0 and 0.20.0 as incompatible with the current public networks (ledger 8): they depend on onchain-runtime-v4, and Midnight.js 4.1.1 pins compact-runtime to 0.16.0. Toolchains 0.34.0 / 0.35.0 target ledger 9 and expect runtime 0.19.0 / 0.20.0.

The published Compact runtime API reference is generated for `@midnight-ntwrk/compact-runtime` v0.20.0. Functions that exist only on the ledger-9 line (for example `jubjubSchnorrSign`, `jubjubSchnorrVerifyingKey`, `sampleJubjubSchnorrSk`) appear in the reference but are not exported by 0.16.0. A developer following the reference on the supported stack sees TypeScript errors such as "has no exported member".

Lab note (source check only): `packages/preprod-hello-stub/src/compact-runtime-api-gap.mjs` records the pin and the reported gap. It does not import the runtime, does not compile Compact, does not call a proof server, and does not claim a fix of the public docs site, indexer, or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
