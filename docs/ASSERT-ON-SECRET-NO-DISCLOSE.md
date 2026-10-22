# Assert on a secret does not require disclose()

Upstream: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official: https://docs.midnight.network/compact/reference/explicit-disclosure

The explicit disclosure page states that disclosure must be declared before storing witness data in the public ledger, returning it from an exported circuit, or passing it to another contract. Issue #266 notes an additional compiler rule learned from error messages: an `assert` on a secret does not require `disclose()`.

On Compact toolchain 0.31.1 (language 0.23) the following compiles:

```compact
export circuit f(): [] {
  assert(secretNum() > 5, "too small");
}
```

while a conditional branch that then writes the ledger rejects without `disclose()`.

Lab sample: `contracts/hello-midnight/assert-private-ok.compact` shows a private derivation used only inside `assert`, with `disclose()` only on the ledger write.

This lab does not claim a fix of the public docs, compiler, or node. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
