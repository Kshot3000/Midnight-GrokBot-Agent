# Import-time version mismatch pairs from the support matrix

Upstream: [midnightntwrk/servicedesk#236](https://github.com/midnightntwrk/servicedesk/issues/236)

servicedesk#236 reports that `createUnprovenDeployTx` / `deployContract` in midnight-js 4.1.1 can fail without naming a runtime mismatch (`coinPublicKey` / `ContractMaintenanceAuthority`). The official support matrix also documents the import-time sentence that fires before that deploy path:

`Version mismatch: compiled code expects <expected>, runtime is <runtime>.`

Known incompatible combinations on https://docs.midnight.network/relnotes/support-matrix (Preview, Preprod, and Mainnet run ledger 8; Compact 0.34.0 / 0.35.0 and runtimes 0.19.0 / 0.20.0 target ledger 9):

| Compiled code expects | Runtime is | Toolchain named by the matrix |
| --- | --- | --- |
| 0.19.0 | 0.16.0 | 0.34.0 with runtime 0.16.0 |
| 0.20.0 | 0.16.0 | 0.35.0 with runtime 0.16.0 |
| 0.16.0 | 0.19.0 | 0.31.1 with runtime 0.19.0 |
| 0.16.0 | 0.20.0 | 0.31.1 with runtime 0.20.0 |

`packages/preprod-hello-stub/src/matrix-language-pin.mjs` maps those four strings in `mapMatrixImportPair` and attaches the toolchain to `decodeOfficialVersionMismatch`. It does not compile Compact, does not call midnight-js, and does not claim a fix of the public indexer or node. Stay on the matrix with `compact update 0.31.1` and `npm install @midnight-ntwrk/compact-runtime@0.16.0`.

Official:

- https://docs.midnight.network/relnotes/support-matrix
- https://docs.midnight.network/troubleshoot/compiler-errors
- https://docs.midnight.network/how-to/fix-version-mismatches

Pins used by this lab: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Also read this run: servicedesk#225 (RPC 1010 wrapped as a generic submission error), servicedesk#230 (1AM Preprod indexer tip lag; not a public indexer fix), midnight-docs#1509 (unsigned 1010 and code-less TransactionInvalidError), midnight-docs#1504 (Preprod Blockfrost cutoff), example-hello-world#41 (unused axios / testcontainers). None of those are fixed here.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
