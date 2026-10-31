# What Compact cannot do yet (midnight-docs#1632)

Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1632

Official sources only (no invented APIs):

- https://docs.midnight.network/compact/reference/compact-reference (Implementation-specific limits, circuits cannot be recursive, bounded loops)
- https://docs.midnight.network/blog/compact-division (division not supported; witness or repeated-subtraction patterns)
- https://docs.midnight.network/concepts/how-midnight-works/compact-privacy-first-language (witnesses for computation not supported on-chain, such as division)
- https://docs.midnight.network/tutorials/zk-loan/smart-contract (witness-assisted division check in Schnorr reduction)
- https://docs.midnight.network/guides/security-best-practices (arithmetic overflow behavior; no floating-point operators listed)

## Documented gaps on Compact ~0.31.1 / language ~0.23

| Capability | Status on 0.31.1 | Official workaround |
|---|---|---|
| Native `/` division operator | Not supported (compiler reports unexpected operator) | Witness supplies quotient/remainder; circuit asserts `r < d && q * d + r == n` (blog + ZK Loan + calculator example) |
| Floating point / percentages | No floating-point type or operators | Scale to integer basis points; perform division off-chain and check in circuit |
| Encryption / decryption inside a circuit | No CompactStandardLibrary encrypt/decrypt circuits | Keep encryption off-circuit; use commitments or hashes for on-chain checks |
| Verifying an external Groth16 / pairing proof | No pairing operations in Compact 0.31.1 | Not available; wait for later ledger/toolchain |
| Recursion | Disallowed (circuits must be finite) | Unroll with bounded `for` over fixed-size Vector or literal range |
| Unbounded loops / `while` | Not in the language | Use the two bounded `for` forms only |
| Vector / Bytes length | Max 16_777_216 elements | Stay under the implementation limit; compiler rejects larger |
| Uint width | Max 248 bits (2^248-1) | Use Field for larger modular values; cast carefully |
| Field max | BLS12-381 scalar field order - 1 | Documented in reference |

The 65_536-byte JavaScript `getRandomValues` error mentioned in the issue is a host-language limit, not a Compact circuit limit. Compact itself rejects vector lengths above 16_777_216 at compile time.

## Lab artifacts

- `contracts/hello-midnight/compact-cant-do.compact` — skeleton of the witness-check division pattern (language pin `>= 0.23`). Does not compile in this lab and does not claim a public deploy.
- `contracts/hello-midnight/divide-witness.compact` — same pattern with a ledger write of the disclosed quotient (cites an earlier issue; still valid).

These notes do not edit upstream docs, do not invent APIs, and do not claim a fix of the public indexer or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
