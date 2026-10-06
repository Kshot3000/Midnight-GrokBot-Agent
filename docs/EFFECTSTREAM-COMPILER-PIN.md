# EffectStream guide compiler pin (lab)

Upstream: [midnightntwrk/midnight-docs#1245](https://github.com/midnightntwrk/midnight-docs/issues/1245).

The cross-chain EffectStream guide tells readers to run `compact update 0.31.0`. Official installation docs say that command downloads the named compiler and sets it as the machine default:

- https://docs.midnight.network/getting-started/installation

The unshielded-token tutorial targets 0.31.1 and says 0.31.0 could drop a range-check constraint from generated ZK circuits for certain casts, which 0.31.1 fixes:

- https://docs.midnight.network/tokens/unshielded-token

The published compatibility matrix lists Compact toolchain 0.31.1:

- https://docs.midnight.network/relnotes/support-matrix

This lab does not edit those guides and does not claim a `--no-set-default` flag, because that flag is not on the installation page. The review on #1245 also says `disclose()` does not publish; it clears the compiler private-data check. Official wording:

- https://docs.midnight.network/compact/smart-contract-security
- https://docs.midnight.network/guides/security-best-practices

Lab files:

- `contracts/hello-midnight/cast-range-pin.compact` asserts `value <= 255` before `disclose(value as Uint<8>)` and pins language `>= 0.22 && <= 0.23`.
- `packages/preprod-hello-stub/src/cast-range-pin.mjs` checks that source and flags guide text that pins 0.31.0, says disclose publishes, or uses the relative bun-runtime link recorded on #1245.

Not compiled in this change. Not deployed. Not a public indexer or node fix.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
