# Dust successor commitment is not a recoverable UTXO

Upstream: [midnightntwrk/servicedesk#112](https://github.com/midnightntwrk/servicedesk/issues/112)

A Preprod `DustSpend` can publish a successor commitment while the local wallet, after restart and indexer catch-up, does not export the cleartext successor UTXO. Issue 112 records that the public event does not include `backingNight`, `owner`, `nonce`, `sequence`, `value`, or `generation`. An unrelated generation UTXO from the same period can still be ingested.

Official wallet recovery (https://docs.midnight.network/concepts/dust-architecture) is:

- identify owned NIGHT UTXOs
- search commitments for sequence numbers 0, 1, 2, ...
- query by bit-prefix, not exact lookup, so the indexer does not learn the commitment

A public commitment alone is not those sequence openings. This lab classifier only names that shape. It does not reconstruct a UTXO, and it does not fix the wallet, the public indexer, or the node.

Lab code: `packages/preprod-hello-stub/src/dust-successor-gap.mjs`

Pins used by this lab: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Those pins are not the wallet version on issue 112.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
