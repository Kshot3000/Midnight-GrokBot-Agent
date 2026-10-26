# ownPublicKey() is a prover-controlled witness, not a caller authenticator

Upstream: [midnightntwrk/midnight-docs#902](https://github.com/midnightntwrk/midnight-docs/issues/902)

Official sources (do not invent APIs):

- Security and best practices: https://docs.midnight.network/guides/security-best-practices  
  "Never authenticate with ownPublicKey(). `ownPublicKey()` is a witness. The prover chooses its return value, and the protocol does not check it against the signing wallet, so `assert(ownPublicKey().bytes == owner)` compares two prover-controlled values and is bypassable. It is only safe when you route a value *to* the caller, as the shielded token tutorial does."
- Compact as a privacy-first language: https://docs.midnight.network/concepts/how-midnight-works/compact-privacy-first-language
- ZK Loan tutorial: https://docs.midnight.network/tutorials/zk-loan/smart-contract  
  Explicitly avoids `ownPublicKey()` for admin and borrower identity; derives from a witness secret instead.
- Private tip jar: https://docs.midnight.network/tutorials/private-tip-jar/smart-contract  
  Uses `ownPublicKey()` only as the payout recipient after an owner-secret assert.
- Compact runtime API (0.20.0 header, while networks pin 0.16.0): https://docs.midnight.network/api-reference/compact-runtime/functions/ownPublicKey

Issue #902 notes that the security guide already warns against direct use of `ownPublicKey()` for caller verification, and asks that the same warning appear on the auto-synced reference surfaces (standard-library exports, compact-runtime functions/globals). Those pages are regenerated and currently lack the warning bar.

## Safe pattern (derived identity)

Declare a secret witness. Derive a public identity with a domain-separated hash. Store the derived key on the ledger at construction. Gate later circuits by re-deriving and asserting equality. The secret never leaves private state; the prover must know it to pass the assert.

```compact
pragma language_version 0.23;
import CompactStandardLibrary;

export ledger owner: Bytes<32>;
witness secretKey(): Bytes<32>;

export circuit claimOwnership(): [] {
  owner = disclose(persistentHash<Vector<2, Bytes<32>>>([pad(32, "lab:owner:"), secretKey()]));
}

export circuit onlyOwner(): [] {
  assert(owner == persistentHash<Vector<2, Bytes<32>>>([pad(32, "lab:owner:"), secretKey()]), "not owner");
}
```

`ownPublicKey()` may be used to name the recipient of a shielded send after the secret-based assert has already restricted the caller. Do not use it as the sole gate.

Lab sample: `contracts/hello-midnight/own-public-key-warning.compact` pins language >= 0.23 (Compact ~0.31.1). Source check: `packages/preprod-hello-stub/src/own-public-key-warning-invariant.mjs` (no compiler, no deploy).

This lab does not edit midnight-docs, does not invent missing exports, and does not claim a fix of the public indexer or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
