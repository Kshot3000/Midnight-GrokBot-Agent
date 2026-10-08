# Sealed deadline uses blockTimeLt

Upstream: [midnightntwrk/midnight-docs#1387](https://github.com/midnightntwrk/midnight-docs/issues/1387)

Official pattern, read 2026-10-08: [Security and best practices — Enforcing a deadline](https://docs.midnight.network/guides/security-best-practices). A sealed field is set once in the constructor. `blockTimeLt(time)` is true when the current block time is before `time`. The guide says there is no raw block-time accessor, and that block time is accurate to the scale of blocks, not seconds.

Issue #1387 tracks Compact reference gaps. Those pages are copied from LFDT-Minokawa/compact, so a docs PR here would not land upstream. This lab sample follows the security guide only. It does not edit the public docs and does not fix the public indexer or node.

`contracts/hello-midnight/sealed-deadline.compact` seals `deadline`, discloses the constructor argument, and gates `claim` with `assert(blockTimeLt(deadline), "expired")`. `claimed` stays unsealed so the circuit can set it. `packages/preprod-hello-stub/src/sealed-deadline-invariant.mjs` checks that source. It does not compile Compact or call a proof server.

Check: `npm run check:sealed-deadline` from `packages/preprod-hello-stub`.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
