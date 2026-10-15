# Wallet sync stalls on Preprod still need a dedicated troubleshooting page

Upstream: [midnightntwrk/midnight-docs#1381](https://github.com/midnightntwrk/midnight-docs/issues/1381)

The issue reports repeated high-pain wallet synchronization stalls on Preprod with no dedicated troubleshooting page. Reported symptoms include `waitForSyncedState()` never resolving, shielded or DUST legs never connecting, `FacadeState.isSynced` staying false, non-linear inserts into the dust commitment tree, and slow full-history replay.

Official page that already covers some of these (checked 2026-10-15):

- https://docs.midnight.network/guides/networks-and-environments — table under connection troubleshooting lists:
  - Saved sync state from the old Midnight-hosted indexer is not portable; event and transaction ids differ. Discard that state and sync from genesis. A full sync on Preprod takes over an hour.
  - On an idle subscription the indexer sends unshielded progress less often (backing off to about 4 minutes, up to about 5 with jitter). After a transaction the "fully synced" signal can lag. Wait for the expected balance or allow more than 5 minutes.
  - Wallet sync is slow after startup while the indexer catches up with the node.

Related official pages:

- https://docs.midnight.network/guides/acquire-tokens — funding path, DUST registration, and the funding troubleshooting table.
- https://docs.midnight.network/sdks/error-reference/wallet-sdk — `SyncWalletError`, connection errors.

This lab does not edit the official docs site.

## Lab classifier

`packages/preprod-hello-stub/src/wallet-sync-stall.mjs` classifies a short symptom string or progress object. It does not open a connection, call midnight-js, contact an indexer, or claim the public indexer or node is fixed.

```bash
cd packages/preprod-hello-stub
node src/wallet-sync-stall.mjs
```

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This note does not invent APIs.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
