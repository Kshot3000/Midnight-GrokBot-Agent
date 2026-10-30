# What Compact can't do yet (lab note)

Upstream: [midnightntwrk/midnight-docs#1632](https://github.com/midnightntwrk/midnight-docs/issues/1632)  
Official sources only (no invented APIs):

- [Compact reference](https://docs.midnight.network/compact/reference/compact-reference) (language 0.27 reviewed; lab pins Compact ~0.31.1 / language ~0.23)
- [Compact as a privacy-first language](https://docs.midnight.network/concepts/how-midnight-works/compact-privacy-first-language)
- [Simulating a division in Compact](https://docs.midnight.network/blog/compact-division)
- [ZK Loan contract](https://docs.midnight.network/tutorials/zk-loan/smart-contract) (witness-assisted reduction)
- [Security and best practices](https://docs.midnight.network/guides/security-best-practices)

## Documented limits and absences

| Topic | Status in official docs | Workaround (from docs) |
|-------|-------------------------|------------------------|
| Floating-point / percentages | Numeric values are unsigned integers only (reference Overview). No floating-point type. | Scale to integers (e.g. basis points) or compute off-chain in a witness and check the result in-circuit. |
| Division | Not a native arithmetic operator (blog; concepts page notes division as example of computation not supported on-chain). | Witness computes quotient/remainder; circuit asserts the equation (see blog and ZK Loan). |
| Recursion | Disallowed (reference: circuits cannot be recursive). | Unroll or use bounded iteration. |
| Unbounded loops | Language is bounded; loops must have compile-time bounds (reference). | Use `for` over fixed-size Vector/Bytes or constant bounds. |
| Size limits | Max Vector/Bytes length 16 777 216; max Uint fits 31 field bytes; Merkle depth 32 (reference + release notes). | Keep types and loop bounds inside the published limits. |
| Encryption / decryption inside a circuit | Not described as available. | Do not invent; keep sensitive crypto in witnesses or outside the circuit. |
| Verifying an outside proof (e.g. Groth16) | Not described. | Do not invent pairing or foreign-proof APIs. |

These notes record only what the cited pages state. They do not claim a compiler change, do not compile contracts in this lab, and do not claim to fix the public indexer or node.

See `contracts/hello-midnight/compact-cant-do.compact` and `packages/preprod-hello-stub/src/compact-cant-do-invariant.mjs`.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
