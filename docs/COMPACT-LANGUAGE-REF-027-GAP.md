# Compact language reference is reviewed for 0.27.0 while public networks pin ~0.23

Upstream: [midnightntwrk/midnight-docs#1564](https://github.com/midnightntwrk/midnight-docs/issues/1564)

Related open docs issue reports that the Compact runtime API reference documents `@midnight-ntwrk/compact-runtime` v0.20.0 while Preview, Preprod, and Mainnet run ledger 8 and the support matrix pairs them with Compact toolchain 0.31.1 and Compact runtime 0.16.0.

The same version skew appears on the language reference:

- Compact reference header: "Reviewed 25 September 2026 for compatibility with Compact language version 0.27.0." https://docs.midnight.network/compact/reference/compact-reference
- Compact toolchain 0.31.0 release notes list Language version: 0.23.0 and Compact runtime version: 0.16.0. https://docs.midnight.network/relnotes/compact/toolchain-0.31.0
- Support matrix lists Compact toolchain 0.31.1 and Compact runtime 0.16.0 for Preprod, Preview, and Mainnet. Known incompatible combinations note that toolchains 0.34.0 / 0.35.0 and runtimes 0.19.0 / 0.20.0 target ledger 9 and do not work with the matrix pins. https://docs.midnight.network/relnotes/support-matrix

A builder who copies a construct that only exists on the 0.27.0 reference into a contract that must run on Preprod will hit a version mismatch or a ledger-8 deploy failure. The hello-world tutorial correctly uses `pragma language_version 0.23;`. https://docs.midnight.network/getting-started/hello-world

This lab does not patch midnight-docs, does not regenerate the language reference for 0.23, and does not invent APIs. `contracts/hello-midnight/language-ref-pin.compact` is a source-only sample that keeps the 0.23 pragma. `packages/preprod-hello-stub/src/language-ref-pin.mjs` classifies a pasted version string so a builder can map a reference quote to the matrix pin. Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. This does not claim to fix the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
