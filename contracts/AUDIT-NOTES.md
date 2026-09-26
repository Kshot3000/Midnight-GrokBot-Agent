# contracts/ audit notes

Lab findings from Midnight AUDIT shifts. Branding for this repo lives in
[`BRANDING.md`](../BRANDING.md) (Cardano donation + X `@kshot9000`). Do **not**
stamp branding into upstream PRs.

## 2026-09-25 — archived Example Counter still listed in awesome-dapps

**Finding:** [`midnightntwrk/midnight-awesome-dapps`](https://github.com/midnightntwrk/midnight-awesome-dapps)
Getting Started still linked
[`Example Counter`](https://github.com/midnightntwrk/example-counter), but that
repo is **archived** / no longer maintained. Official onboarding prefers
[`example-bboard`](https://github.com/midnightntwrk/example-bboard) and
[`create-mn-app`](https://github.com/midnightntwrk/create-mn-app) (Create Midnight App).

**Action:** Upstream PR (or ready patch if PR blocked) marks Counter archived and
points newcomers at the live starters without duplicating existing list entries.

- PR: https://github.com/midnightntwrk/midnight-awesome-dapps/pull/194

**Lab fold-in:**

- `hello-midnight/hello.compact`: pragma bumped `0.16` → `>= 0.23` (align with
  `agent-escrow`); Next-steps comments warn **never authorize with
  `ownPublicKey()` alone** (MPS-0029) and point at witness-derived identity /
  `contracts/agent-escrow` + example-bboard.
- This note records the finding for continuous audit work.

## MPS-0029 reinforcement (`ownPublicKey` auth)

**Finding:** Authorizing privileged circuits with `ownPublicKey()` alone is
bypassable (prover-supplied value). Lab `contracts/agent-escrow` already uses
`localSecretKey` + `persistentHash` role commitments with a domain separator —
same family of pattern as example-bboard / leaderboard tutorials.

## Pointers for newcomers / Lace

- Prefer **example-bboard** + **create-mn-app**; treat **example-counter** as
  historical only.
- Lace Midnight discovery must **enumerate `window.midnight`** (do not assume a
  single provider key). Lab implementation:
  `packages/lace-midnight-kit`.

## Compact compile status

These audit commits update comments/pragma only unless a later note says
otherwise. **Do not claim Compact compiled** unless the Compact toolchain was
actually run in that shift.

## 2026-09-25 (evening) — Kshot-owned Midnight apps improve pass

Cross-repo improvements (this lab + sisters). No Compact toolchain run this
shift — **do not claim compile**.

### Agent Escrow JS/Python (Qwen Builder)

**Finding:** Off-chain reference allowed the agent string to appear in the
`approvers` set at create time. Runtime still blocked self-approval, but Compact
skeleton already requires `agentPk ≠ approverPk` at `initialize`.

**Lab fold-in (sister repo):**
https://github.com/Kshot3000/Cardano-Midnight-Qwen-Builder/commit/a63c7e936a7f38dc531055d080309bd398567bc3

- Reject agent-as-approver at create (JS + Python) — MPS-0029 / separation analogue
- New [`COMPACT-PORT.md`](https://github.com/Kshot3000/Cardano-Midnight-Qwen-Builder/blob/main/apps/agent-escrow/COMPACT-PORT.md)
  bridges JS/Python → this lab’s `contracts/agent-escrow`, with live starters
  (example-bboard / create-mn-app; Counter archived)

### NightDream.io

**Finding:** Apex `nightdream.io` is **NXDOMAIN**. GitHub Pages URL works:
https://kshot3000.github.io/NightDream.io/

**Lab fold-in:**
https://github.com/Kshot3000/NightDream.io/commit/0d4fe3fbe9614d70a8304d36e7325ae3aeda2909

- `docs/DNS.md` — A/AAAA/CNAME → GitHub Pages
- NightForge network strip on Midnight page (soft-fail)
- Footer stamps Cardano donation + `@kshot9000` (canonical branding)

Remote already rebuilt the desk onto live CoinGecko / DexScreener / Koios /
CIP-30 — this pass did not regress that.

### nocturne

**Finding:** README still pointed at placeholder `nocturne-messenger` Pages URL
and claimed a deleted `404.html`.

**Lab fold-in:**
https://github.com/Kshot3000/nocturne/commit/a3579b93e7931feb0df043ac5e49d3fdbf572028

- Restored themed `404.html`; live URL https://kshot3000.github.io/nocturne/
- Honesty / README: MPS-0029 + live starters for any future on-chain identity

### Still blocked / out of scope

- Compact compile of `contracts/agent-escrow` / `hello-midnight` (toolchain not
  installed in this environment)
- Upstream midnightntwrk PRs (handled by another agent / recorded in
  [`docs/UPSTREAM-SWEEP-2026-09-25.md`](../docs/UPSTREAM-SWEEP-2026-09-25.md))
- Auto-posting to X
