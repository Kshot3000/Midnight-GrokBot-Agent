# Calculator division is a witness constrained by assert

Upstream: [midnightntwrk/midnight-docs#1387](https://github.com/midnightntwrk/midnight-docs/issues/1387)

Compact reference pages are copied from LFDT-Minokawa/compact, so a docs-site edit would be overwritten. The Kapa review still asked for Compact snippets that show how a witness is checked. The calculator example already publishes that pattern.

Official source (do not invent a division API): https://docs.midnight.network/examples/contracts/calculator

- `divMod` is declared as a witness. Its body is off-chain and unknown to the contract.
- `divide` binds `[quo, rem] = divMod(num1, num2)` and asserts `rem < num2 && quo * num2 + rem == num1` with the message `incorrect division`.
- A malicious prover chooses witness returns. Without that assert, a lying quotient is unconstrained.
- The lab contract stores `disclose(quo)` on `result`. `disclose()` does not publish by itself; the ledger write does. The official sample returns `quo` and does not show that store.

Lab contract: `contracts/hello-midnight/divide-witness.compact`

`packages/preprod-hello-stub/src/divide-witness-invariant.mjs` is a source check only. It does not compile Compact, does not call proof-server 8.1.0, and does not claim a Preprod deploy. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This lab note does not fix the public indexer or node.

Also restored the missing comma in `packages/preprod-hello-stub/package.json` so `check:proof-server-argv` parses again. That was a lab packaging break, not a public node fix.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
