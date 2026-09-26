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
