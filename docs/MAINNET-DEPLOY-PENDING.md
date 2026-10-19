# Mainnet contract deploys stay pending until TTL

Upstream: [midnightntwrk/servicedesk#257](https://github.com/midnightntwrk/servicedesk/issues/257)

Official deploy path (no mention of a public filter flag):

- https://docs.midnight.network/guides/deploy-and-operate — `deployContract` / `submitDeployTx`
- https://docs.midnight.network/nodes/node-toolkit — toolkit deploy / call builders
- https://docs.midnight.network/relnotes/support-matrix — pin versions before you deploy

Issue #257 reports that valid contract-deploy transactions on mainnet are accepted into public RPC pools (`author_pendingExtrinsics`), pass `TaggedTransactionQueue_validate_transaction` (Valid) and `BlockBuilder_apply_extrinsic` (Ok), but are never included before their TTL. Contract calls submitted in the same windows are included. The report links this to nodes started with `--filter-deploy-txs` (which refuse any tx containing a deploy, including gossiped ones, while letting calls through). Related: servicedesk#34 and midnight-improvement-proposals#361 (deploy guards described as lifted around 2026-09-28).

This lab does not push to midnightntwrk, does not claim the public indexer or node is fixed, and does not invent an API for the filter flag. Pins remain Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Lab files:

- `packages/preprod-hello-stub/src/deploy-pending-ttl-decode.mjs` — classifies pasted pool / validation text. Matches pending-until-TTL + Valid validate + Ok apply while calls land, and surfaces the reported `--filter-deploy-txs` hypothesis. No network calls.
- `contracts/hello-midnight/deploy-pending-note.compact` — Compact note only. No circuit. Points builders at the off-chain classifier.

Workaround until operators confirm the flag is gone from the path to producers: prefer a local network or Preprod for deploy tests (official docs describe both), re-check `author_pendingExtrinsics` and TTL, and do not treat a Valid validate + pending pool as proof the deploy will be included. Calls succeeding while deploys expire is the symptom #257 records.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
