# Preprod 1010 with no inner u8: exhaust the block limits

Upstream: [midnightntwrk/servicedesk#225](https://github.com/midnightntwrk/servicedesk/issues/225)

Official how-to: [Decode 1010 transaction rejection errors](https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors)

midnight-js 4.1.1 can surface only `Transaction submission error`. When the node text is recovered, it is often `1010: Invalid Transaction: Transaction would exhaust the block limits` with no `Custom error: N`. The official how-to says code 1010 is a Substrate envelope. The actionable ledger signal is the inner u8. A 1010 with no inner u8 is Substrate validation, not a `LedgerApiError`.

Do not map that sentence onto either of these table rows:

| Code | Official variant | When it applies |
| --- | --- | --- |
| 154 | BlockLimitExceededError | `Custom error: 154` (infrastructure) |
| 232 | FeeCalculation.BlockLimitExceeded | `Custom error: 232` (malformed transaction) |

This lab only decodes strings the node already returns. It does not fix the public Preprod node or indexer. Related open reports: [#230](https://github.com/midnightntwrk/servicedesk/issues/230) (indexer tip lag) and [#226](https://github.com/midnightntwrk/servicedesk/issues/226) (subset deploy when one transaction is too heavy).

`packages/preprod-hello-stub/src/rpc-errors.mjs` sets `noInnerU8` on the bare exhaust sentence and names 154 and 232 only when `Custom error: N` is present. Check: `node src/block-limit-no-u8.mjs` from `packages/preprod-hello-stub`.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
