# Branching on a witness requires disclose() before a ledger write

Upstream: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official:

- https://docs.midnight.network/compact/reference/explicit-disclosure
- https://docs.midnight.network/guides/security-best-practices

Issue #266 (opened 2026-10-21, Compact toolchain 0.31.1 / language ~0.23 and also 0.35.0) reports that the compiler rejects:

```compact
export circuit f(): [] {
  if (secretNum() > 5) {
    val = 1;
  } else {
    val = 2;
  }
}
```

with "potential witness-value disclosure must be declared but is not". The nature of the disclosure is the ledger operation that depends on the witness-derived comparison.

The same issue notes that an `assert` on a secret is accepted (no disclosure), while a Map key and a return of a witness require `disclose()`. The conditional that affects a ledger write is a disclosure site.

The form that satisfies the reported check wraps the comparison in `disclose()`:

```compact
if (disclose(secretNum() > 5)) {
  val = 1;
} else {
  val = 2;
}
```

Lab sample: `contracts/hello-midnight/branch-witness-disclose.compact`

`packages/preprod-hello-stub/src/branch-witness-disclose-invariant.mjs` is a source check only. It does not compile Compact, does not call proof-server 8.1.0, and does not claim a Preprod deploy or a fix of the public indexer or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
