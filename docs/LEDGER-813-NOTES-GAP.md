# Ledger 8.1.3 release-notes gap

Upstream: [midnightntwrk/midnight-docs#1453](https://github.com/midnightntwrk/midnight-docs/issues/1453)

Official ledger index: https://docs.midnight.network/relnotes/ledger

That page, read 2026-10-05, still marks **Release 8.1.2** as LATEST (24 August 2026). Its component table lists ledger 8.1.2, 8.1.1, 8.1.0, 8.0.3, 8.0.2, and 7.0.0. It does not list 8.1.3.

Issue #1453 says the Ledger 8.1.3 release has no release notes in the docs, and points at the tag https://github.com/midnightntwrk/midnight-ledger/releases/tag/ledger-8.1.3 (published 2026-10-02). The tag page does not include a summary this lab can quote, so this note does not invent a changelog.

The support matrix still pins proof server **8.1.0**: https://docs.midnight.network/relnotes/support-matrix

This lab keeps that pin. Compact stays ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1. `packages/preprod-hello-stub/src/ledger-notes-gap.mjs` classifies a docs-behind-tag sample and rejects a lab proof-server pin of 8.1.3 until a notes page exists. It does not download the ledger, and it does not fix the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
