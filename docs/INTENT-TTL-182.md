# Preprod Custom error 182 stays TransactionApplicationError

Upstream: [midnightntwrk/midnight-docs#1509](https://github.com/midnightntwrk/midnight-docs/issues/1509)

Related: [servicedesk#225](https://github.com/midnightntwrk/servicedesk/issues/225). The node 1010 runbook PR [servicedesk#238](https://github.com/midnightntwrk/servicedesk/pull/238) records that nodes 1.0.0 through 1.0.400 share one table, and that node 2.x moves 182 to 228-230 and 193 to 242-244. Preprod still uses the 1.0.x table. This lab does not change public docs and does not claim a public node or indexer fix.

Official node error codes (checked 2026-10-08) name `182` `TransactionApplicationError`: intent TTL has expired or is too far in the future. Rebuild with a new TTL and submit before it passes. The same page names `193` `ReplayProtectionViolation` and `196` `DustDoubleSpend`.

A code-less `TransactionInvalidError: Transaction is invalid and was rejected by the node` is the case #1509 says is still missing from the how-to. Do not invent `Custom error: 182` or `196` for that string. The reproduced pending-DUST case logged `DustDoubleSpend` on the node only.

`packages/preprod-hello-stub/src/intent-ttl-182.mjs` classifies strings the caller already has. It does not call `wallet.submitTransaction` and does not invent a Compact or midnight-js API.

Official:

- https://docs.midnight.network/nodes/error-codes
- https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
