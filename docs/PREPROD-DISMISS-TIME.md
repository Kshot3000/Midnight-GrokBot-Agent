# Preprod dismiss-time rejection (OutsideTimeToDismiss)

Upstream: [midnightntwrk/servicedesk#117](https://github.com/midnightntwrk/servicedesk/issues/117)

A Compact call that uses `receiveUnshielded` or `sendUnshielded` can deploy, then fail at submission. The node log in that report is:

```
Transaction malformed: exceeded the maximum time to dismiss for transaction size; this transaction would take 15.706ms to dismiss, but given its size of 7090 bytes, it may take at most 15.000ms Malformed(FeeCalculation(OutsideTimeToDismiss))
```

The RPC form is `1010: Invalid Transaction: Custom error: 231`. Official tables name that variant `FeeCalculation.OutsideTimeToDismiss`: the transaction exceeds the maximum allowed time-to-dismiss for its byte size.

- https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors
- https://docs.midnight.network/api-reference/error-reference/ledger-errors

The report's control was a larger pure-state call that was accepted, so a smaller byte size is not proof the call will pass. This lab does not change the fee model and does not fix the public node or indexer.

`packages/preprod-hello-stub/src/rpc-errors.mjs` names the node sentence even when the wrapper only says `Transaction submission error` and the text is `OutsideTimeToDismiss` or `maximum time to dismiss`, without a `Custom error: N` line. When `Custom error: 231` is present, the existing ledger-code path still wins.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. No new RPC method.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
