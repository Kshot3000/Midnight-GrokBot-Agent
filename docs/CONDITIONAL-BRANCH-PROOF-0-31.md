# Conditional branch proof failures (Compact toolchain 0.31.0 workaround)

Upstream / official: https://docs.midnight.network/relnotes/compact/toolchain-0.31.0

Compact toolchain 0.31.0 (language ~0.23) includes workarounds so that operations in untaken conditional branches cannot fail during proof construction. Earlier toolchains could produce erroneous proof failures when a branch that was not taken still contained operations the prover considered.

During proof construction both branches of a conditional are part of the relation. Downcasts, certain conversions, and relational comparisons on values that might be unknown could fail even if the branch was not executed at runtime.

## What the official release notes say

From https://docs.midnight.network/relnotes/compact/toolchain-0.31.0 (checked 2026-10-20):

- Operations in untaken branches are changed so that they cannot fail during proof construction.
- Affected operations: downcasts from Uint to smaller Uint, Field to Uint, byte-vector conversions to/from Field/Uint, vector-to-byte-vector, and relational comparisons (<, <=, >, >=) with inputs that might be unknown.
- Downside: the workarounds can increase generated circuit size. If that is a problem, move the operations outside conditionally executed Compact code.

Pins for this lab: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Official docs only. This note does not invent APIs and does not claim any public node or indexer fix.

## What builders should do

- Prefer computing potentially failing casts and comparisons outside the conditional, then branch on a Boolean that is already known.
- Assert ranges before downcasting when the value is under the circuit's control.
- Expect larger circuits after the 0.31.0 workaround; measure prover-key size if the contract is large.

## Lab sample

`contracts/hello-midnight/conditional-branch-safe.compact` shows a pattern that keeps a downcast outside the branch. LOCAL-TRUE. Source only. Not deployed.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
