# Agent Escrow (Compact skeleton)

Milestone-based escrow for AI-agent work on **Midnight**, ported as a Compact
contract skeleton from the JS/Python reference protocol:

- Spec / reference impl:  
  https://github.com/Kshot3000/Cardano-Midnight-Qwen-Builder/tree/main/apps/agent-escrow
- Layout / compile patterns: official
  [`example-bboard`](https://github.com/midnightntwrk/example-bboard) and
  [`create-mn-app`](https://github.com/midnightntwrk/create-mn-app) (`bboard` template)
- Auth pattern: bulletin-board + leaderboard tutorials (witness secret →
  `persistentHash` commitment) — **not** `ownPublicKey()` alone (**MPS-0029**)

> **Status:** educational skeleton. **Compiled successfully** with Compact
> **0.31.1** / language **0.23.0** on the lab box (2026-09-26 CT) — TS
> bindings + 12 circuit proving keys generated under `src/managed/`
> (gitignored). Local ZK prove: `npm run prove:escrow-local` (default multi-circuit
> **happy** path with synthetic client/agent/approver secrets vs `:6300`;
> `prove:escrow-all` covers all 12 impure). **Not** an on-chain deploy.

## Layout

```
contracts/agent-escrow/
├── README.md                 # this file
├── package.json              # compact compile script (create-mn-app style)
└── src/
    └── agent-escrow.compact  # Compact source
```

UI stub (local state machine only — no wallet / no deploy):  
[`apps/agent-escrow-stub/`](../../apps/agent-escrow-stub/)

## Compact version pin (~0.31.1)

| Piece | Lab expectation | Notes |
| --- | --- | --- |
| **Compact compiler** | **~0.31.1** | Matches `create-mn-app` remote examples (`bboard`, `battleship`, `leaderboard`). Install / pin via Midnight’s install guide + compatibility matrix — do not guess. |
| **Language pragma** | `pragma language_version >= 0.23;` | Preferred here. Official `example-bboard` often pins exact `0.23`. If your compiler rejects `>=`, change the pragma to `pragma language_version 0.23;` and recompile. |
| **Proof server** | Docker image/tag from the install guide | Required to generate ZK proofs for real circuits. |
| **midnight-js / connector** | Matrix peers (lab Lace kit uses `@midnight-ntwrk/dapp-connector-api@4.0.1`) | Verify against the current Midnight compatibility matrix before wiring a DApp. |

Official install: https://docs.midnight.network/getting-started/installation  
Compact overview: https://docs.midnight.network/compact  
Language reference: https://docs.midnight.network/compact/reference/compact-reference  
Bboard tutorial: https://docs.midnight.network/examples/dapps/bboard  
Leaderboard contract: https://docs.midnight.network/tutorials/leaderboard/smart-contract

### Compile (after Compact 0.31.1 is installed)

```bash
# From repo root
npm run compact:escrow
# From this directory
npm run compact
# equivalent:
#   compact compile +0.31.1 src/agent-escrow.compact ./src/managed/agent-escrow
```

Artifacts land under `src/managed/agent-escrow/` (ZKIR, keys, TS bindings).
Gitignored. Lab verification (2026-09-26 CT): **12 circuits** compiled with
prover/verifier keys (~38MB managed tree).

### Compact 0.23 fixes applied so this skeleton compiles

1. **Uint widening** — `(a + b) as Uint<64>` / `(a - b) as Uint<64>` on
   `milestoneTotal`, `released`, `refunded`, and refund balance locals
   (Compact addition widens beyond `Uint<64>`).
2. **Explicit disclosure on dual-role OR** — `assertIsApprover` discloses
   derived role commitments before `clientPk == … || approverPk == …`
   (see Midnight explicit-disclosure docs). Secret key stays private.

## Auth: MPS-0029 (do not use `ownPublicKey()` alone)

`ownPublicKey()` returns a **prover-supplied** value. Anyone who reads a stored
key from the public ledger can replay it inside a proof. It identifies a
*target* (mint-to, credit-to); it does **not** authorize a privileged action.

This contract registers **role commitments** at `initialize`:

```text
roleCommitment(sk, tag) =
  persistentHash([ pad(32, "agent-escrow:role:"), tag, sk ])
```

- **Client** proves `roleCommitment(localSecretKey(), "client") == clientPk`
- **Agent** proves the `"agent"` tag against `agentPk` (submit proofs only)
- **Approver** proves `"approver"` **or** `"client"` against stored commitments

Separation of duties: `initialize` requires `agentPk` ≠ `clientPk` and
`agentPk` ≠ `approverPk`, so the agent cannot satisfy `assertIsApprover`.

Same family of pattern as bboard’s `publicKey(sk, sequence)` and the
leaderboard’s `ownerCommitment(sk)`.

## Circuits (skeleton)

| Circuit | Who | Effect |
| --- | --- | --- |
| `initialize(agent, approver)` | client (witness) | Register role commitments |
| `addMilestone(amount, deadline)` | client | Insert milestone into `Map` |
| `fund(amount)` | client | `CREATED → FUNDED` |
| `start()` | client | `FUNDED → IN_PROGRESS` (milestones ≤ funded) |
| `submitProof(id, proofHash)` | agent | `PENDING → PROOF_SUBMITTED` |
| `approve(id)` | client or approver | Release milestone funds |
| `reject(id)` | client or approver | Reject proof; funds stay escrowed |
| `dispute()` | client | Freeze → `DISPUTED` |
| `resolveDisputeRefund()` | client | Full remaining refund → `REFUNDED` |
| `resolveDisputeResume()` | client | Back to `IN_PROGRESS` |
| `settle()` | client | All decided → refund remainder → `SETTLED` |
| `cancel()` | client | Before start → `CANCELLED` |

Amounts are integer subunits (map to lovelace off-chain). Proof verification is
**off-chain / ZK claim** in the reference protocol — this skeleton stores a
`Bytes<32>` proof commitment only.

## Intentionally out of scope (v0 skeleton)

- Multi-approver sets / rotating approvers
- On-ledger audit log events (reference JS keeps a full audit array)
- Native shielded token transfers / coin ADTs (wire via Midnight.js later)
- Automatic late-penalty logic (`deadline` is stored for future hooks)
- On-chain deploy scripts or faucet funding

## Local ZK prove (no chain)

```bash
# requires: npm run compact:escrow + proof-server on :6300
npm run prove:escrow-local   # default path=happy (7 circuits, synthetic roles)
npm run prove:escrow-all     # all named paths → 12/12 impure circuits
```

Synthetic **client / agent / approver** secrets; `fund()` is ledger `Uint` only
(no Coin/Zswap needed for local prove). See
[`ARTIFACT-CONSUMERS.md`](../ARTIFACT-CONSUMERS.md). **Not** a Preprod deploy.

## Branding

- **X:** [@kshot9000](https://x.com/kshot9000)
- **ADA:** `addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v`
- Canonical: [`BRANDING.md`](../../BRANDING.md)
