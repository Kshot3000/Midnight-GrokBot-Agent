# Proof-server DUST spend rejection (custom error 170)

Upstream issue: https://github.com/midnightntwrk/servicedesk/issues/252

Official references (do not invent):
- Node error codes: https://docs.midnight.network/nodes/error-codes (code 170 = InvalidDustSpendProof)
- DUST sponsorship / errors: https://docs.midnight.network/guides/dust-sponsorship
- Managing DUST: https://docs.midnight.network/guides/manage-dust
- Compatibility matrix: https://docs.midnight.network/relnotes/support-matrix (Proof server 8.1.3 for Preview/Preprod/Mainnet)
- Local proving: https://docs.midnight.network/guides/local-proving (version endpoint returns e.g. 8.1.0)

## What the issue reports

On Midnight Stagenet (node 2.0.0, ledger line newer than public Preprod), proof-server 9.0.0-rc.9 produces DUST-spend proofs that the node rejects with `1010: Invalid Transaction: Custom error: 170` (`InvalidDustSpendProof`). The same transaction proved by 9.0.0-rc.5 finalizes. Proving itself succeeds; the rejection is at the node on the fee leg. This lab does not claim to fix the public indexer, node, or proof-server image.

## Lab pins (this repo only)

- Compact toolchain ~0.31.1 / language ~0.23
- midnight-js 4.1.1
- DApp Connector 4.0.1
- proof-server **8.1.0** (matrix lists 8.1.3; stay on the documented public-network line)

Do not point Preprod or Mainnet builders at 9.x rc images. Those target ledger 9 / Stagenet-style environments. Official matrix and install docs keep public networks on the 8.1.x proof-server.

## Common causes of 170 (from official docs)

1. Wallet builds/proves the DUST fee spend before it has applied every DUST event (unsynced or restored state). Wait for `waitForSyncedState()`, then rebuild, prove, and submit.
2. Proof-server / ledger version mismatch (as in servicedesk#252). Match the proof-server image to the node/ledger line listed in the support matrix.
3. Stale DUST roots after idle time; resync and rebuild.

This document and the companion decoder in `packages/preprod-hello-stub/src/dust-170-decode.mjs` only classify the text and point to the docs. They do not change node, indexer, or proof-server behavior.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
