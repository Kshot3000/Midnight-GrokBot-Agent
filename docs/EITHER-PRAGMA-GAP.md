# Either choice on the public-network Compact pin

Upstream: [midnightntwrk/midnight-docs#1387](https://github.com/midnightntwrk/midnight-docs/issues/1387)

Official stdlib: [Either, left, right](https://docs.midnight.network/compact/standard-library/exports)

Kapa traffic could not answer how to use `Either` in a Compact contract, and a builder asked whether generated code's unbounded `>= 0.26` pragma is the right pin. Official examples on the public networks use a bounded language pragma. Compact toolchain 0.35 / language 0.27 targets ledger 9 and is not for contracts deployed today (`compact update 0.31` stays on language 0.23).

This lab does not edit midnight-docs. It does not fix the public indexer or node.

## What the published API is

`Either<A, B>` is a struct, not a keyword:

```
struct Either<A, B> {
  isLeft: Boolean;
  left: A;
  right: B;
}
```

Constructors are the standard-library circuits `left<A, B>(value)` and `right<A, B>(value)`. If `isLeft` is true, `left` is populated and `right` should be `default<>`. The other way around when `isLeft` is false. There is no `Either.Left` constructor in the published exports page.

## Lab source

`contracts/hello-midnight/either-choice.compact` pins `pragma language_version >= 0.22 && <= 0.23`, builds both sides with `left` / `right`, asserts the inactive `Uint<64>` stays `0` (the default), then `disclose`s only the populated field into the ledger. It does not call `kernel.caller()` (ledger 9 only).

`packages/preprod-hello-stub/src/either-choice-invariant.mjs` is a source check. It does not run the Compact compiler.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
