# Mainnet deploy filter hypothesis (servicedesk#257)

Upstream: [midnightntwrk/servicedesk#257](https://github.com/midnightntwrk/servicedesk/issues/257)

Official docs (no public filter flag documented):

- https://docs.midnight.network/guides/deploy-and-operate
- https://docs.midnight.network/nodes/node-toolkit
- https://docs.midnight.network/relnotes/support-matrix

Issue #257 reports that valid mainnet contract-deploy transactions are accepted into public RPC pending pools, pass `TaggedTransactionQueue_validate_transaction` (Valid, propagate true) and `BlockBuilder_apply_extrinsic` (Ok), yet remain pending until TTL expires and are never included. Contract calls in the same windows are included normally. The report asks whether any producers or relays still run with `--filter-deploy-txs`, which (per the issue) refuses any tx containing a deploy while allowing calls. Related: servicedesk#34 and MIP #361 (guards described as lifted ~2026-09-28).

This lab does not push to midnightntwrk, does not claim the public indexer or node is fixed, and does not invent an API or flag. Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

## Lab files

- `contracts/hello-midnight/deploy-filter-note.compact` — Compact note only (no circuit). Pins the symptom for builders.
- `packages/preprod-hello-stub/src/deploy-filter-decode.mjs` — offline classifier for pasted pool/validate/apply text. Matches the #257 pattern and surfaces the filter hypothesis. No network calls.

Workaround until operators confirm: use official local or Preprod deploy paths for testing. A Valid validate + pending pool is not proof of inclusion. Calls landing while deploys expire is the recorded symptom.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
