# FeeCalculation OutsideTimeToDismiss decoding for unshielded ops

Upstream: [midnightntwrk/servicedesk#117](https://github.com/midnightntwrk/servicedesk/issues/117)

Official sources only:

- Decode 1010: https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors  
  168 FeeCalculation / 155 FeeCalculationError: the ledger cannot calculate a fee when validating and applying the guaranteed part would take longer than allowed for a transaction of that size. Split the work.
- Node error codes: https://docs.midnight.network/nodes/error-codes  
  168 FeeCalculation — Transaction size or timing parameters are invalid. Tables are for node 1.0.x.
- Ledger errors: https://docs.midnight.network/api-reference/error-reference/ledger-errors  
  FeeCalculationError.OutsideTimeToDismiss — The transaction exceeds the maximum allowed time-to-dismiss for its byte size.
- Support matrix: https://docs.midnight.network/relnotes/support-matrix — Preprod / Preview / Mainnet run node 1.0.400.

servicedesk#117 reports that a Compact call using `receiveUnshielded` or `sendUnshielded` deploys, then is rejected at submission with `1010: Invalid Transaction: Custom error: 231` and node text `Malformed(FeeCalculation(OutsideTimeToDismiss))`. A larger pure-state call was accepted, so the rejection is not explained by byte size alone. The published 1.0.x table lists 168, not 231. The 231 appears on 2.x builds. The ticket remains open until a release containing the fix in midnight-ledger#761.

This lab records the official classification for the pinned public networks (code 168) and the reported 231 distinction. It does not submit a transaction, does not invent APIs, and does not claim the public indexer or node is fixed.

Decoder: `packages/preprod-hello-stub/src/fee-calc-dismiss-decode.mjs`  
`classifyDismissError(text)` extracts the Custom error code and flags the known case. No network calls.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
