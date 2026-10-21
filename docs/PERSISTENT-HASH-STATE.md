# Derive ledger state with persistentHash, then assert

Upstream: [midnightntwrk/servicedesk#203](https://github.com/midnightntwrk/servicedesk/issues/203)

Official: https://docs.midnight.network/compact/standard-library/exports

`persistentHash<T>(value: T): Bytes<32>` is the official non-circuit-optimised SHA-256 compression. The exports page says it should be used to derive state data, and not for consistency checks where avoidable. The same note that applies to `transientHash` applies here: a result that can be stored in the public ledger need not be wrapped in `disclose`.

servicedesk#203 measures prover keys of 90–570 MB on Stagenet circuits and reports that `persistentHash` sits in every state-writing circuit, including the ~90 MB floor that has no foreign-curve signature. The issue asks for a SHA-256 gadget and native signature verification. This lab does not claim those gadgets exist, does not claim a smaller key, and does not fix the public proof server, indexer, or node.

`contracts/hello-midnight/persistent-hash-state.compact` shows the official form under the lab pins (Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0). It is not compiled here. `packages/preprod-hello-stub/src/persistent-hash-invariant.mjs` classifies source the caller already has. `npm test` in that package covers the classifier.

Also read this run: servicedesk#264 (Stagenet validator-04 stall), servicedesk#254 (faucet amount unit), midnight-docs#1587 (quickstart scaffolder, blocked), midnight-docs#1579 (bboard rewrite), example-hello-world#41 (unused deps). None of those are fixed here.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
