# Returning a circuit argument needs no disclose()

Upstream: https://github.com/midnightntwrk/servicedesk/issues/266

Official: https://docs.midnight.network/compact/reference/explicit-disclosure

servicedesk#266 reports that on Compact 0.31.1 (language ~0.23):

- `return x;` on an exported-circuit argument is accepted without `disclose()`.
- `return secretNum();` (a witness) is rejected with "potential witness-value disclosure must be declared but is not".
- A value returned from an exported circuit reaches the calling DApp (`callTx.private.result`) but is not present in the published transaction bytes. A disclosed ledger store is.

The Explicit disclosure page groups "returning it from an exported circuit" with ledger stores as a disclosure point. The lab sample in `contracts/hello-midnight/return-arg-no-disclose.compact` shows the accepted argument return and the disclosed witness return. It does not invent APIs, does not claim a fix to the public indexer or node, and does not patch upstream docs.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
