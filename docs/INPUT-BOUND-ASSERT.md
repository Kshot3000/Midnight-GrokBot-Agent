# Input bound assert in Compact (function-like form)

Upstream: [midnightntwrk/midnight-docs#1487](https://github.com/midnightntwrk/midnight-docs/issues/1487) (Test and debug page samples do not run as written; some expected assert messages and syntax do not match the contract).

Official security best practices: [Security and best practices](https://docs.midnight.network/guides/security-best-practices) — assert ranges on circuit inputs before use so a failure carries a clear message.

Compact language ~0.23 / toolchain ~0.31.1 uses the function-like `assert(condition, "message")` form (breaking change from the old statement form). See the Compact keywords and release notes on docs.midnight.network.

This lab sample (`contracts/hello-midnight/input-bound-assert.compact`) shows a small exported circuit that:

- declares `pragma language_version 0.23;`
- asserts `n <= 1_000_000` with a clear message before writing the ledger
- uses `disclose` for the public write

`packages/preprod-hello-stub/src/input-bound-assert.mjs` checks the source for the pragma, the modern assert call, and the disclose. It does not compile Compact, does not call a proof server, and does not claim a public indexer or node fix.

Pins remain Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
