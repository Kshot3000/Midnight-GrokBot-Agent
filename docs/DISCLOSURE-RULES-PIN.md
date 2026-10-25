# Three Compact disclosure rules from servicedesk#266

Upstream: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official: https://docs.midnight.network/compact/reference/explicit-disclosure

The explicit disclosure page requires a program to declare disclosure before storing witness data in the public ledger, returning it from an exported circuit, or passing it to another contract. Issue #266 (Compact toolchain 0.31.1 / language ~0.23, also checked on 0.35.0) reports three additional rules learned from compiler errors:

1. A circuit argument used as a Map key needs `disclose()`, even inside `assert(m.member(k))`. The bare form is rejected.
2. Branching on a witness and then writing the ledger needs `disclose()`. The bare `if (secretNum() > 5) { val = 1; } else { val = 2; }` is rejected.
3. An `assert` on a secret does not require `disclose()`. `assert(secretNum() > 5, "too small")` is accepted.

The writing page notes that private data used only to compute an `assert` subexpression may be implicitly disclosed. The Map-key and branch-then-ledger cases reported in the issue are stricter and require an explicit `disclose()`.

This lab does not invent APIs, does not edit the public docs, and does not claim a fix of the public indexer or node.

## Lab source

`contracts/hello-midnight/disclosure-rules-pin.compact` pins `pragma language_version >= 0.22 && <= 0.23`.

- `hasKey` uses `assert(m.member(disclose(k)), "missing")`.
- `branchOnWitness` uses `if (disclose(secretNum() > 5))`.
- `assertSecret` uses a bare `assert(secretNum() > 5, "too small")`.

`packages/preprod-hello-stub/src/disclosure-rules-pin-invariant.mjs` is a source check. It does not compile Compact, does not call proof-server 8.1.0, and does not deploy.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
