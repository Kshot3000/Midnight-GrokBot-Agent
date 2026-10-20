# Exported circuit and constructor arguments require disclose

Upstream: [midnightntwrk/midnight-docs#1487](https://github.com/midnightntwrk/midnight-docs/issues/1487)

Official Compact 0.16.0 release notes (https://docs.midnight.network/relnotes/compact/compact-0-16-24-0):

> [Breaking] Exported circuit and constructor arguments are required to be `disclose`d

Compact requires witness return values that can be observed on chain to be wrapped in the `disclose` operator. Previously this applied to witness return values written into the public ledger. The argument values passed to exported circuits and to a contract's constructor can be observed on chain. In Compact 0.16.0 this requirement was extended to those arguments.

Related official pages:
- https://docs.midnight.network/compact/reference/writing
- https://docs.midnight.network/guides/security-best-practices
- https://docs.midnight.network/relnotes/support-matrix (networks run Compact runtime 0.16.0; see also midnight-docs#1564)

The test-and-debug page samples (midnight-docs#1487) fail against the supported stack in part because they do not follow the current disclosure and circuit-context rules. This lab does not edit the public docs.

## Lab source

`contracts/hello-midnight/exported-arg-disclose.compact` pins `pragma language_version >= 0.22 && <= 0.23` (Compact ~0.31.1).

- `constructor(initial: Bytes<32>)` writes `note = disclose(initial)`.
- `setNote(value: Bytes<32>)` writes `note = disclose(value)`.
- `echoPrivate` returns `disclose(privateNote())`.

`packages/preprod-hello-stub/src/exported-arg-disclose-invariant.mjs` is a source check. It does not run the Compact compiler and does not deploy.

This does not claim to fix the public indexer or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
