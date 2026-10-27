# Disclosure sites reported in servicedesk#266

Upstream: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official: https://docs.midnight.network/compact/reference/explicit-disclosure

The explicit disclosure page requires a Compact program to declare disclosure before storing witness data in the public ledger, returning it from an exported circuit, or passing it to another contract. Issue #266 (Compact toolchain 0.31.1 / language ~0.23, also checked on 0.35.0) reports several concrete compiler outcomes:

- Returning a circuit argument (`return x;`) is accepted without `disclose()`. The caller already knows the argument.
- Returning a witness value is rejected unless wrapped in `disclose()`.
- An `assert` on a secret number is accepted (no `disclose()`).
- A circuit argument used as a Map key requires `disclose()` even inside `assert(m.member(k))`.
- A conditional branch on a witness that then writes the ledger requires `disclose()` on the condition.

Lab sample (source only, not compiled or deployed): `contracts/hello-midnight/disclosure-sites-266.compact`.

`packages/preprod-hello-stub/src/disclosure-sites-266-invariant.mjs` performs a source-pattern check. It does not invoke the compiler, prove, or contact any network. This lab does not claim a fix of the public docs, indexer, or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
