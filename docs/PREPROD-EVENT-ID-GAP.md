# Preprod event-id gaps are not a cursor to shift

Upstream: [midnightntwrk/servicedesk#216](https://github.com/midnightntwrk/servicedesk/issues/216)

Related docs request: [midnightntwrk/midnight-docs#1381](https://github.com/midnightntwrk/midnight-docs/issues/1381)

Official guide: [Networks and environments](https://docs.midnight.network/guides/networks-and-environments)

servicedesk#216 reports that the official Preprod indexer skips ledger event ids 989781–989802 at block 1130996, so those event ids differ from other indexers. The networks guide already says saved sync state is not portable: event and transaction ids differ between indexers. That covers `serializeState()` output, fast-sync or preseed bundles, and stored event or transaction ids. The documented response is to discard that state and sync from genesis. Do not shift cursors by hand. A full Preprod sync takes over an hour. Wallets that sync from genesis on every start, and DApps that only read contract state or submit transactions, are not affected.

This lab does not re-query the public indexer and does not fix it or the node. `packages/preprod-hello-stub/src/event-id-gap.mjs` only classifies event ids the caller already observed:

- a jump across 989781–989802 is labeled `reported-preprod-skip`
- any other hole is `event-id-gap`
- a saved cursor resumed on a different host is `non-portable-resume`
- a resume index inside 989781–989802 is the same non-portable class

The helper never adds the missing count onto a saved index. Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
