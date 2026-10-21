# DUST silent subscription stall (lab)

Upstream: [midnightntwrk/servicedesk#251](https://github.com/midnightntwrk/servicedesk/issues/251) reports that Wallet SDK 1.2.0 never notices a Preprod DUST indexer subscription that stays open but stops delivering events. `progress.isConnected` stays true, the applied index stays put, and nothing errors, times out, or resubscribes until the connection drops.

Related docs request: [midnightntwrk/midnight-docs#1381](https://github.com/midnightntwrk/midnight-docs/issues/1381) asks for a troubleshooting page on wallet sync stalls on Preprod.

Official sources only:

- https://docs.midnight.network/guides/manage-dust (DUST troubleshooting: wait for sync before building a fee spend)
- https://docs.midnight.network/nodes/error-codes (code 170 = InvalidDustSpendProof: "A wallet that builds the transaction before it has synced every DUST event produces this error.")
- https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors (extract the inner u8 from a 1010 Invalid Transaction)
- https://docs.midnight.network/relnotes/support-matrix (Preprod: Wallet SDK 1.2.0, Midnight.js 4.1.1, proof-server 8.1.3 / lab pin 8.1.0)

This lab does not invent APIs, does not claim to fix the public indexer or node, and does not change Wallet SDK behaviour. A silent subscription that leaves the wallet behind can later surface as 1010 Custom error 170 when a DUST spend proof is built against a stale commitment tree. The official fix surface is to wait for events (or drop and resubscribe) before proving and submitting.

Lab checker (no network): `packages/preprod-hello-stub/src/dust-silent-subscription-classify.mjs`.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
