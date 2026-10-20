# assert is a function-like expression (not a statement)

Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1487

midnight-docs#1487 reports that the test-and-debug page samples do not run as written against the support matrix (Compact toolchain 0.31.1, runtime 0.16.0, midnight-js 4.1.1). Several samples still use older Compact shapes.

One breaking change that still trips samples is the form of `assert`. Official release notes for Compact 0.16.0 / compiler 0.24.0 state:

> [Breaking] assert is now a function-like expression operator

Previously:

```
assert age() >= 18 "failed age check";
```

Now:

```
assert(age() >= 18, "failed age check");
```

Official page: https://docs.midnight.network/relnotes/compact/compact-0-16-24-0

The writing-a-contract page already uses the new form: https://docs.midnight.network/compact/reference/writing

This lab note and the companion Compact file pin the function-like form under language ~0.23 / Compact ~0.31.1. They do not invent APIs, do not claim a public compiler or node fix, and are source-only.

See also:

- `contracts/hello-midnight/assert-function-like.compact`
- `packages/preprod-hello-stub/src/assert-function-like-invariant.mjs`

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Official docs only: https://docs.midnight.network/.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
