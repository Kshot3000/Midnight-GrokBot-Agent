# Either field name depends on the compiler pin

Upstream: [midnightntwrk/midnight-docs#1387](https://github.com/midnightntwrk/midnight-docs/issues/1387)

Follow-up filed by the docs owners: [LFDT-Minokawa/compact#833](https://github.com/LFDT-Minokawa/compact/issues/833)

This lab does not edit midnight-docs or the Compact repo. It does not fix the public indexer or node.

## What each published surface says

The public Midnight docs page still describes `Either` as:

```
struct Either<A, B> {
  isLeft: Boolean;
  left: A;
  right: B;
}
```

Source: https://docs.midnight.network/compact/standard-library/exports

Constructors on that page are `left<A, B>` and `right<A, B>`. This lab's public-network sample (`contracts/hello-midnight/either-choice.compact`) stays on that spelling because the lab pin is Compact ~0.31.1 / language ~0.23, the set in https://docs.midnight.network/relnotes/support-matrix.

Compact issue #833 says the opposite for compiler 0.35.0 (language 0.27, ledger 9, not the public-network pin). The example they checked is:

```
export pure circuit leftOrZero(e: Either<Uint<32>, Bytes<32>>): Uint<32> {
  return e.is_left ? e.left : 0;
}
```

midnight-docs#1387 notes that the synced site still shows `isLeft`, which that newer compiler rejects, and that LFDT-Minokawa/compact#796 renamed the field to `is_left` in the Compact repo docs. Those Compact repo docs have not replaced the page on docs.midnight.network.

## What to do

- Public preprod / preview / mainnet contracts on Compact 0.31.1: read `choice.isLeft`. Do not copy `is_left` from the 0.35 example.
- A compiler 0.35 experiment: read `e.is_left`. Do not copy `isLeft` from the public docs page.
- Do not mix the two in one file. This lab checker only classifies source. It does not run `compact compile`.

`packages/preprod-hello-stub/src/either-choice-invariant.mjs` exports `classifyEitherField`.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
