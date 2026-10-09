# ContractMaintenanceAuthority instance error has two causes

Upstream: [midnightntwrk/servicedesk#236](https://github.com/midnightntwrk/servicedesk/issues/236)

The 2026-10-09 retest on that issue says `expected instance of ContractMaintenanceAuthority` still does not name why. It covers two situations: a nested compact-runtime that brings its own onchain-runtime (v3 or v4), and a 0.16.0 contract on the ledger-9 offline deploy path even when there is only one runtime copy. The same note says `Ledger8DeployOnV9Error` already exists and the offline builder never reaches it. The original report still stands for midnight-js 4.1.1, which is the network support-matrix pin.

Official class page (committee keys, not this instance failure): https://docs.midnight.network/api-reference/ledger/classes/ContractMaintenanceAuthority

Official matrix: https://docs.midnight.network/relnotes/support-matrix

`packages/preprod-hello-stub/src/authority-instance-split.mjs` classifies a string the caller already has. Pass `npm list` paths to name the nested copy. A ledger-9 note with one path names the offline path. It does not call `createUnprovenDeployTx`, does not wire `Ledger8DeployOnV9Error`, and does not fix the public indexer or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Also read this run: servicedesk#225 (RPC 1010 wrapped as a generic submission error), midnight-docs#1509 (code-less TransactionInvalidError), midnight-docs#1502 (node 1.0.400 notes gap), example-hello-world#41 (unused axios / testcontainers). None of those are fixed here.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
