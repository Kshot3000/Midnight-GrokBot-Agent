# Either field name depends on the compiler pin

Upstream: [midnightntwrk/midnight-docs#1387](https://github.com/midnightntwrk/midnight-docs/issues/1387)

Follow-up filed by the docs owners: [LFDT-Minokawa/compact#833](https://github.com/LFDT-Minokawa/compact/issues/833)

This lab does not edit midnight-docs or the Compact repo. It does not fix the public indexer or node.

## What the published page says now

Read 2026-10-09 of https://docs.midnight.network/compact/standard-library/exports

The synced standard-library page now describes `Either` as:

```
struct Either<A, B> {
  is_left: Boolean;
  left: A;
  right: B;
}
```

`Maybe` on that same page uses `is_some`, not `isSome`. Constructors stay `left<A, B>` and `right<A, B>`. The inactive side should be `default<>`.

That is the spelling midnight-docs#1387 said the Compact repo already corrected (`is_left` in LFDT-Minokawa/compact#796) while the Midnight site still showed `isLeft`. The site copy has moved. An earlier lab note that said this URL still showed `isLeft` is stale.

## What the public-network pin still uses

The support matrix still pins Compact toolchain `0.31.1` and language `0.23`: https://docs.midnight.network/relnotes/support-matrix

`contracts/hello-midnight/either-choice.compact` keeps `choice.isLeft` for that pin. Copying `is_left` from the synced page into a 0.31.1 file is the mismatch #1387 described, only the page and the pin have swapped roles. A compiler 0.35.0 experiment (language 0.27, not this pin) is the one that reads `e.is_left`.

## What to do

- Public preprod / preview / mainnet contracts on Compact 0.31.1: read `choice.isLeft`. Do not copy `is_left` from the current standard-library page.
- A compiler 0.35 experiment: read `e.is_left`. Do not copy `isLeft` from an older snapshot of the page.
- Do not mix the two in one file. This lab checker only classifies source and a pasted page excerpt. It does not run `compact compile`.

`packages/preprod-hello-stub/src/either-page-drift.mjs` exports `classifyEitherPageDrift`.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
