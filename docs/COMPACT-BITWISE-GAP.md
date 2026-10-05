# Compact has no bitwise operators on the public-network pin

Upstream: [midnightntwrk/midnight-docs#1387](https://github.com/midnightntwrk/midnight-docs/issues/1387)

Official grammar: [Compact grammar](https://docs.midnight.network/compact/reference/compact-grammar)

Official arithmetic: [Binary arithmetic expressions](https://docs.midnight.network/compact/reference/compact-reference#binary-arithmetic-expressions)

Kapa traffic asked "does compact have bit operator" and found no bitwise mention under `docs/`. The published grammar (page labeled Compact language 0.26.0) still has no `&`, `|`, `^`, `<<`, `>>`, or `>>>` production. Logical operators are `||` and `&&`. Binary arithmetic operators in the language reference are `+`, `-`, and `*`. [CompactStandardLibrary exports](https://docs.midnight.network/compact/standard-library/exports) do not list a shift or bitwise circuit, and do not list an in-circuit `networkId` (a separate question on the same issue).

This lab pins Compact toolchain ~0.31.1 / language ~0.23 (`pragma language_version >= 0.22 && <= 0.23`). It does not edit midnight-docs. It does not fix the public indexer or node.

## Lab source

`contracts/hello-midnight/no-bitwise.compact` folds a Boolean with the documented ternary (`flag ? 1 : 0`), asserts the fold is 0 or 1, and `disclose`s it into `Uint<8>`. It does not use a bit operator.

`packages/preprod-hello-stub/src/bitwise-gap-invariant.mjs` is a source check. It does not run the Compact compiler. `&&` and `||` are not treated as bitwise.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
