# Support matrix pin check (lab)

Upstream: [midnightntwrk/servicedesk#236](https://github.com/midnightntwrk/servicedesk/issues/236) — midnight-js deploy construction fails with errors that don't name the cause when the contract's runtime differs from midnight-js's. The official fix is to align with the support matrix.

Official source of truth:
- https://docs.midnight.network/relnotes/support-matrix
- https://docs.midnight.network/how-to/fix-version-mismatches

This lab note does not invent APIs and does not claim a fix to the public indexer, node, or midnight-js. It only records the published Preprod pins and a local classifier so builders can compare their `package.json` / `compact` version before they hit the opaque deploy error.

## Preprod matrix pins (quoted)

- Node (Midnight): 1.0.400
- Compact toolchain: 0.31.1
- Compact runtime: 0.16.0
- Midnight.js: 4.1.1
- DApp Connector API: 4.0.1
- Proof server: 8.1.3 (this lab tracks 8.1.0)
- Wallet SDK: 1.2.0
- On-chain runtime: 3.0.0

Known incompatible: Compact toolchain 0.34.0/0.35.0 and runtimes 0.19.0/0.20.0 target ledger 9 and do not work with the matrix versions.

## Lab helper

`packages/preprod-hello-stub/src/support-matrix-pin-check.mjs` exports the matrix object and a pure classifier. Run:

```bash
node packages/preprod-hello-stub/src/support-matrix-pin-check.mjs
```

Pins used here: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
