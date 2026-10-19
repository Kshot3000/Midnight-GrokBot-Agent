# Compact validation sample: disclose and default, not Bytes{}

Upstream: [midnightntwrk/midnight-docs#1487](https://github.com/midnightntwrk/midnight-docs/issues/1487)

The [Test and debug](https://docs.midnight.network/compact/test-and-debug) page shows a transfer circuit that does not compile under Compact toolchain 0.31.1 / language ~0.23:

- Top-level `const MAX_AMOUNT: Uint<64> = ...` is rejected by the issue report (const bindings are documented inside blocks).
- `Bytes<32>{}` is not a value form.
- The ledger write `balance = balance - amount` needs `disclose()` because circuit parameters are potentially private ([Explicit disclosure](https://docs.midnight.network/compact/reference/explicit-disclosure)).

Official default for `Bytes<n>` is the all-zero byte array ([Compact reference](https://docs.midnight.network/compact/reference/compact-reference)). The lab source `contracts/hello-midnight/validation-disclose-pin.compact` therefore:

1. Places the bounds constants inside the circuit.
2. Rejects the all-zero recipient with `recipient != default<Bytes<32>>`.
3. Writes `balance = disclose(balance - amount)` only after the asserts.

This file does not compile the contract, does not call midnight-js, and does not claim the public page or the indexer/node is fixed.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
