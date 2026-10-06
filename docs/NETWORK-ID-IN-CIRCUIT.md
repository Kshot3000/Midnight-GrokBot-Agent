# No in-circuit networkId

Upstream: [midnightntwrk/midnight-docs#1387](https://github.com/midnightntwrk/midnight-docs/issues/1387)

Kapa could not answer whether a Compact circuit can read `networkId`, how to declare an event type and use `emit`, or what `disclose(deserialize<Boolean, 1>(flag))` returns. This lab note only cites the published pages. It does not edit midnight-docs, and it does not claim the public indexer or node is fixed.

## What the pages say

Kernel operations: https://docs.midnight.network/compact/reference/ledger-adt

The Kernel section lists `balance`, `balanceGreaterThan`, `balanceLessThan`, `blockTimeGreaterThan`, `blockTimeLessThan`, `checkpoint`, `claimContractCall`, `claimUnshieldedCoinSpend`, `claimZswapCoinReceive`, `claimZswapCoinSpend`, `claimZswapNullifier`, `incUnshieldedInputs`, `incUnshieldedOutputs`, `mintShielded`, `mintUnshielded`, and `self`. It does not list `networkId`. `kernel.self()` returns `ContractAddress`. That is not a network id.

Events: https://docs.midnight.network/compact/reference/compact-reference

`emit(e)` requires a standard event type. The reference example is `emit(ShieldedSpend { nullifier: disclose(n) })`. The type of `emit` is `[]`. Emitting from a constructor is a static error. Decoding uses `deserialize`, as in `deserialize<ShieldedSpend, 32>(x)` and, for a one-byte flag, `deserialize<Boolean, 1>(flag)`. `disclose` does not change that type. It only clears the compiler private-data check.

Keywords: https://docs.midnight.network/compact/reference/compact-keywords

`emit` is a statement keyword. `event` is reserved for future use, so a contract does not declare `event Flag`.

`transientHash` (same Kapa review): https://docs.midnight.network/api-reference/compact-runtime/functions/transientHash

The runtime page says it is not guaranteed to persist between upgrades and should not derive state data. It may be used for consistency checks. The auto-synced page is compact-runtime 0.19.0; this lab still pins compact-runtime 0.16.0 from the support matrix.

## Lab check

`contracts/hello-midnight/no-network-id.compact` stores `disclose(kernel.self().bytes)`, emits `ShieldedSpend`, and returns `deserialize<Boolean, 1>`. `packages/preprod-hello-stub/src/network-id-invariant.mjs` flags `kernel.networkId`, an `event` declaration, constructor `emit`, and a ledger write of `transientHash`. LOCAL-TRUE. Not compiled in this change. Not deployed.

Pins used by this lab: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
