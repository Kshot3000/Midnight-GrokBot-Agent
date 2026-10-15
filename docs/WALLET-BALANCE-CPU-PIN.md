# WalletFacade balance/finalization pins CPU and grows RSS

Upstream: [midnightntwrk/servicedesk#194](https://github.com/midnightntwrk/servicedesk/issues/194)

Open report: after a proven unbound transaction is handed to WalletFacade for balance/finalization, the call does not return. The operator process becomes CPU-bound and RSS grows (example: ~510 MiB to ~1.74 GiB) until an external watchdog kills it. The transaction is never submitted. A control path that does the same deploy/register/init sequence succeeds.

The report pins Wallet SDK umbrella 1.2.0, Facade 4.1.0, Shielded 3.0.2, DUST 4.2.0, Unshielded 3.1.0, midnight-js 4.1.1, Compact 0.31.1 / language 0.23, proof-server 8.1.0, node 1.0.0, indexer 4.3.3. Those match this lab’s pins. Official Wallet SDK guide: https://docs.midnight.network/sdks/official/wallet-dev-guide

This lab does not invent a balance API or a timeout. It does not claim the public wallet SDK, indexer, or node was fixed. Builders who see a hang after “wallet-balance/finalization-enter” with rising RSS should treat it as the #194 pattern, capture the same pending/coin/DUST state the report lists, and file against the wallet SDK rather than the proof server or node.

Related lab classifier: `packages/preprod-hello-stub/src/wallet-balance-stall.mjs` (symptom check only).

This does not fix the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
