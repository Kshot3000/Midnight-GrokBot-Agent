# Pure circuit return of argument sum accepted without disclose()

Upstream: https://github.com/midnightntwrk/servicedesk/issues/266

Official: https://docs.midnight.network/compact/reference/explicit-disclosure

servicedesk#266 shows that returning a circuit argument (or a pure expression
of arguments) compiles without `disclose()` on Compact toolchain 0.31.1
(language 0.23) and 0.35.0. Returning a witness value is rejected.

The writing guide notes the exception: data in exported-circuit arguments is
not considered disclosed when returned, because the caller already knows it.

## Lab pin

`contracts/hello-midnight/return-pure-sum-accepted.compact` shows the pure
form from the issue:

```compact
export pure circuit add(a: Uint<8>, b: Uint<8>): Uint<16> {
  return a + b;
}
```

`packages/preprod-hello-stub/src/return-pure-sum-accepted-invariant.mjs` is a
source-level check only. It does not invoke the Compact compiler, does not
prove, and does not deploy.

This lab does not edit midnight-docs and does not claim the public indexer or
node is fixed.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1,
proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
