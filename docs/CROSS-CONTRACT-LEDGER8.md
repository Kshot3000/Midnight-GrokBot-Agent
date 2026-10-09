# Cross-contract calls are a ledger-9 feature, not a 0.31.1 fix

Upstream: [midnightntwrk/servicedesk#236](https://github.com/midnightntwrk/servicedesk/issues/236)

The compiler-errors page documents this sentence:

`cross-contract calls are not yet supported`

It fires when a contract makes a cross-contract call while compiling for a ledger earlier than 9, or with ZKIR v2. The same page says those calls arrived with ledger version 9 and ZKIR v3 (toolchain 0.33.0 and later). The support matrix says Preview, Preprod, and Mainnet run ledger 8, and Compact 0.34.0 / 0.35.0 target ledger 9, so those toolchains cannot deploy there.

servicedesk#236 is what follows if a builder bumps anyway: midnight-js 4.1.1 deploy construction fails without naming the cause (`coinPublicKey` / `ContractMaintenanceAuthority`) when the contract runtime is 0.19.0 or 0.20.0. This lab does not add a cross-contract API. `contracts/hello-midnight/no-cross-contract.compact` keeps a local `tick` circuit on `pragma language_version 0.23`. `packages/preprod-hello-stub/src/cross-contract-pin.mjs` only classifies the official compiler sentence and a 0.34.0 / 0.35.0 bump. It does not compile Compact, does not call midnight-js, and does not claim a fix of the public indexer or node.

Official:

- https://docs.midnight.network/troubleshoot/compiler-errors
- https://docs.midnight.network/relnotes/support-matrix
- https://docs.midnight.network/compact/reference/compact-reference

Pins used by this lab: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Also read this run: servicedesk#225 (RPC 1010 wrapped as a generic submission error), servicedesk#230 (1AM Preprod indexer tip lag; not a public indexer fix), midnight-docs#1509 (unsigned 1010 and code-less TransactionInvalidError), midnight-docs#1504 (Preprod Blockfrost cutoff), midnight-docs#1092 (Aura to BABE docs, blocked), example-hello-world#41 (unused axios / testcontainers). None of those are fixed here.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
