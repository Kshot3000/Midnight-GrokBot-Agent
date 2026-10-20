# Assert private data is implicitly disclosed in conditions

Upstream: [midnightntwrk/midnight-docs#1487](https://github.com/midnightntwrk/midnight-docs/issues/1487)

Official writing reference (do not invent APIs):

- https://docs.midnight.network/compact/reference/writing
- "the use of private data to compute the boolean value of an assert subexpression is allowed to be implicitly disclosed, since it is so often used to assert properties of private data."
- https://docs.midnight.network/guides/security-best-practices
- `disclose()` is still required when the private value itself leaves the circuit (ledger write, exported return, cross-contract call).

Issue #1487 reports that the test-and-debug page samples fail because they pass the wrong context shape and expect the wrong error strings. The same page also uses patterns that must respect the disclose rules for the pinned language ~0.23.

This lab file `contracts/hello-midnight/assert-private-implicit-pin.compact` shows the documented pattern: an `assert` on a private witness comparison does not need an extra `disclose` on the condition, while a later ledger write of the same private value does. It is source-only. No compile or deploy is claimed. The lab does not fix the public indexer or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Also read this run: servicedesk#264 (Stagenet validator stall), #254 (faucet amount), #252 (DUST 170), midnight-docs#1564 (runtime API version), example-hello-world#41.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
