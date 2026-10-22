# Branching on a witness then writing the ledger requires disclose()

Upstream: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official:

- https://docs.midnight.network/compact/reference/explicit-disclosure
- Section "Indirect disclosure via conditional expression"
- https://docs.midnight.network/compact/reference/compact-reference

From the explicit disclosure page: a Compact program must declare disclosure before storing a value in the public ledger, returning it from an exported circuit, or passing it to another contract. The compiler's witness-protection program also tracks indirect paths, including conditionals.

Issue #266 (opened 2026-10-21) lists three additional rules observed from compiler errors on toolchain 0.31.1 (language 0.23) and 0.35.0:

- a circuit argument used as a Map key needs `disclose()`, even inside `assert(m.member(k))`
- branching on a witness and then writing the ledger needs `disclose()`
- `assert` on a secret does not

This note covers the second rule.

The rejected form (from the issue):

```compact
export circuit f(): [] {
  if (secretNum() > 5) {
    val = 1;
  } else {
    val = 2;
  }
}
```

is rejected with a potential witness-value disclosure error. The ledger write is reachable from a branch that depends on a witness.

The accepted form discloses the witness value (or the comparison result) before the branch:

```compact
const n = disclose(secretNum());
if (n > 5) {
  val = 1;
} else {
  val = 2;
}
```

Lab sample: `contracts/hello-midnight/witness-branch-disclose.compact` (source only, language pin >= 0.23).  
Invariant check: `packages/preprod-hello-stub/src/witness-branch-disclose-invariant.mjs` (no compiler invocation, no invented APIs).

This lab does not claim a fix of the public docs site, indexer, or node. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
