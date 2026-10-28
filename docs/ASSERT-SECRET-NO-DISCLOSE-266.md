# Assert on secret needs no disclose() (servicedesk#266)

Upstream: https://github.com/midnightntwrk/servicedesk/issues/266

Official docs:
- https://docs.midnight.network/compact/reference/explicit-disclosure
- https://docs.midnight.network/guides/security-best-practices

## Reported behavior

On Compact 0.31.1 (language ~0.23) and also 0.35.0, the following is accepted by the compiler:

```compact
export circuit f(): [] {
  assert(secretNum() > 5, "too small");
}
```

An `assert` that only reads witness data is not treated as a disclosure site. The compiler does not require `disclose()` around the comparison.

This matches the Explicit disclosure page: disclosure must be declared before storing in the public ledger, returning from an exported circuit, or using the value in a way that affects what is stored or returned. A pure assert does none of those.

## Contrast

- Branching on a witness and then writing the ledger **does** require `disclose()` on the condition (see `contracts/hello-midnight/branch-witness-disclose.compact`).
- Returning a witness value **does** require `disclose()` (see `contracts/hello-midnight/disclosure-return-vs-ledger-266.compact`).
- Using a circuit argument as a Map key **does** require `disclose()` even inside `assert(m.member(k))` (see `contracts/hello-midnight/map-key-disclose.compact`).

## Lab artifact

`contracts/hello-midnight/assert-secret-no-disclose-266.compact` shows the accepted form.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This lab note does not change upstream docs or claim a fix of the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
