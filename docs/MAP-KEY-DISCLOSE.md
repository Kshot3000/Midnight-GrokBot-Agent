# Map key from a circuit argument requires disclose()

Upstream: https://github.com/midnightntwrk/servicedesk/issues/266

Official:
- https://docs.midnight.network/compact/reference/explicit-disclosure
- https://docs.midnight.network/compact/reference/writing (Confidentiality)

servicedesk#266 reports that on Compact 0.31.1 (language ~0.23) and on 0.35.0 the compiler rejects:

```compact
export circuit f(k: Bytes<32>): [] {
  assert(m.member(k), "missing");
}
```

with "potential witness-value disclosure must be declared but is not". The same issue notes that returning a circuit argument does not require `disclose()`, and that an `assert` on a secret number is accepted. The Map-key position is treated as a disclosure site even when it appears only inside `assert(m.member(...))`.

The writing page states that private data is considered disclosed when it is used to compute the boolean value of an `assert` subexpression, and that this particular use is allowed to be implicitly disclosed. The Map-key case reported in the issue is stricter: the key itself must be wrapped in `disclose()` before it is passed to `member`.

This lab note does not invent APIs, does not claim a fix to the public indexer or node, and does not edit the upstream docs. It only records the reported compiler outcome and the form that satisfies it.

## Lab source

`contracts/hello-midnight/map-key-disclose.compact` pins `pragma language_version >= 0.22 && <= 0.23`.

- `hasKey` uses `assert(m.member(disclose(k)), "missing")`.
- `setKey` uses `m.insert(disclose(k), disclose(v))`.

`packages/preprod-hello-stub/src/map-key-disclose-invariant.mjs` is a source check. It does not compile Compact and does not call the proof server. LOCAL-TRUE.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
