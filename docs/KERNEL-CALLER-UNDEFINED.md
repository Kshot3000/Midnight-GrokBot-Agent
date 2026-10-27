# kernel.caller is undefined on the public Compact pin

Upstream: https://github.com/midnightntwrk/servicedesk/issues/202

Official docs only:
- Compact release notes: https://docs.midnight.network/relnotes/compact — public networks still use `compact update 0.31`
- Support matrix: https://docs.midnight.network/relnotes/support-matrix — Preprod Compact toolchain 0.31.1, Compact runtime 0.16.0, language pin aligned with ~0.23

servicedesk#202 reports that a callee cannot read its caller. On Compact 0.33 / 0.34 the compiler rejects the attempt with:

```
compactc: operation caller undefined for ledger field type Kernel
```

The issue says the ledger already fills a caller slot, but Compact on the public pin has no read, and CallContext does not carry the calling entry point. `kernel.caller()` is not part of Compact ~0.31.1 / language ~0.23. This lab does not invent that API, does not compile against a newer toolchain, and does not claim a fix of the public compiler, indexer, or node.

## Lab check

`packages/preprod-hello-stub/src/kernel-caller-undefined-decode.mjs` classifies that exact compiler string. It returns `kind: 'kernel-caller-undefined'` and points builders at the public pin. An unrelated Compact assert is left unrecognized.

A public-network workaround that stays on the pin (explicit disclosed commitment, empty-slot assert, no `kernel.caller`) already lives in `contracts/hello-midnight/explicit-callee.compact`. That file is source-only and LOCAL-TRUE.

Run:

```bash
node --test packages/preprod-hello-stub/test/kernel-caller-undefined-decode.test.mjs
```

Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
