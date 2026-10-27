# Return circuit argument accepted without disclose()

Upstream: https://github.com/midnightntwrk/servicedesk/issues/266

Official: https://docs.midnight.network/compact/reference/explicit-disclosure

The explicit-disclosure page states that a program must declare disclosure before returning a value from an exported circuit (among other public boundaries). Issue #266 shows that returning a circuit argument compiles cleanly without `disclose()` on Compact 0.31.1 (language 0.23) and 0.35.0, while returning a witness value is rejected with the expected "potential witness-value disclosure must be declared" error.

On-chain probes in the issue confirm that returned values reach the DApp (`tx.private.result`) but are absent from the published transaction bytes. A disclosed ledger store is present in the transaction.

## Lab pin

`contracts/hello-midnight/return-arg-accepted-no-disclose.compact` shows the accepted pattern:

```compact
export circuit returnArg(x: Uint<64>): Uint<64> {
  calls.increment(1);
  return x;
}
```

`packages/preprod-hello-stub/src/return-arg-accepted-invariant.mjs` is a source-level check only. It does not invoke the Compact compiler, does not prove, and does not deploy.

This lab does not edit midnight-docs and does not claim the public indexer or node is fixed.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
