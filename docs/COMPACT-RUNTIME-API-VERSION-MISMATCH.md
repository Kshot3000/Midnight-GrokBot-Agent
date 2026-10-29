# Compact runtime API reference documents 0.20.0, but networks run 0.16.0

Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1564

The generated Compact runtime API reference on docs.midnight.network currently documents `@midnight-ntwrk/compact-runtime` 0.20.0 (paired with Compact toolchain 0.35.0 / language ~0.23+ and ledger 9). Public Preview, Preprod, and Mainnet run ledger 8 and require Compact toolchain 0.31.1 with Compact runtime 0.16.0 (see the official compatibility matrix at https://docs.midnight.network/relnotes/support-matrix).

Using the 0.20.0 reference against a 0.16.0 runtime produces import-time errors such as:

```
Version mismatch: compiled code expects 0.16.0, runtime is 0.20.0
```

or the reverse when a 0.31.1-compiled contract is imported under a newer runtime. Midnight.js 4.1.1 pins `@midnight-ntwrk/compact-runtime` to 0.16.0 and `@midnight-ntwrk/onchain-runtime-v3` to 3.0.0; 0.19.0/0.20.0 runtimes depend on onchain-runtime-v4 and fail `deployContract` with “Failed to configure constructor context with coin public key”.

## Pinning for the current networks

From official docs (https://docs.midnight.network/relnotes/support-matrix and https://docs.midnight.network/getting-started/installation):

```bash
compact update 0.31.1
npm install @midnight-ntwrk/compact-runtime@0.16.0
# and matching midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0 (or 8.1.3 as listed in the matrix)
```

Do not run a bare `compact update` or `npm install @midnight-ntwrk/compact-runtime` without a version; both pull the latest, which targets ledger 9.

This lab note does not change the public docs or indexer/node. It only records the mismatch reported in midnight-docs#1564 and the matrix-aligned pins that work on Preprod/Preview/Mainnet today.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
