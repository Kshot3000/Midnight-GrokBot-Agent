# EffectStream guide pins an rc compiler the matrix does not list

Upstream: [midnightntwrk/midnight-docs#1245](https://github.com/midnightntwrk/midnight-docs/issues/1245)

Official matrix (Preview, Preprod, Mainnet): Compact toolchain 0.31.1. Toolchains 0.34.0 and 0.35.0 target ledger 9 and do not work with that matrix.

- https://docs.midnight.network/relnotes/support-matrix

The published cross-chain EffectStream guide, read 2026-10-08, tells readers to unzip `compactc_v0.33.0-rc.2` and shows `pragma language_version >= 0.17`. Issue #1245 already recorded that the verified public pin is compactc 0.31.1 at language 0.23.0. This lab does not claim 0.33.0-rc.2 targets ledger 9; the matrix names that only for 0.34.0 and 0.35.0.

- https://docs.midnight.network/guides/build-cross-chain-dapp-with-effectstream

Lab files:

- `contracts/hello-midnight/effectstream-rc-pin.compact` stays on `pragma language_version >= 0.22 && <= 0.23`, asserts `value <= 255` before `disclose(value as Uint<8>)`, and does not name the rc compiler.
- `packages/preprod-hello-stub/src/effectstream-rc-pin.mjs` is a source check. It does not run the Compact compiler.

Not compiled in this change. Not deployed. Not a public indexer or node fix.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
