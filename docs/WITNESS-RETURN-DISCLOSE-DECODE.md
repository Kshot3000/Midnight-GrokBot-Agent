# Witness return requires disclose() — Compact compiler error decode

Upstream: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official:
- https://docs.midnight.network/compact/reference/explicit-disclosure
- https://docs.midnight.network/compact/reference/writing

servicedesk#266 confirms that returning a witness value from an exported circuit is a disclosure that the compiler requires to be declared with `disclose()`. Returning a circuit argument is accepted without `disclose()` because the caller already knows the value. The published transaction does not contain the returned value in either case (only ledger writes do).

The compiler error (quoted from the issue and matching the official page) looks like:

```
Exception: ... line N char M:
  potential witness-value disclosure must be declared but is not:
    witness value potentially disclosed:
      the return value of witness ...
    nature of the disclosure:
      the value returned from exported circuit ... might disclose the witness value
```

## Lab stand-in

- `contracts/hello-midnight/witness-return-must-disclose.compact` shows the accepted form (`return disclose(secretNum())`) and notes the rejected form.
- `packages/preprod-hello-stub/src/witness-return-disclose-decode.mjs` classifies compiler stderr lines that match this case. It performs no compilation and no network calls.

This lab does not claim to fix the public indexer, node, or compiler.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
