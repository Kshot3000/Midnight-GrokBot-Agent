# Veil Pledge Studio

Private tip jar & pledge board for Midnight — **local-true** educational studio.

Seal amounts · public commitment hashes · threshold theater (prove ≥ T without revealing tip) · selective disclose.

**Real local features:** `localStorage` persistence (schema v2), **multi-tab sync** (`BroadcastChannel` + `storage` events), **Export / Import JSON**, vitest for core helpers.

Starfield + aurora, donate dock (`@kshot9000` + Cardano addr). Honest **LOCAL-TRUE · not on-chain** labels — no Compact / Lace / ADA settlement claims from the UI pledges.

## Run locally

```bash
cd apps/veil-pledge
python3 -m http.server 5179
# open http://localhost:5179
```

Tests:

```bash
cd apps/veil-pledge
npm install
npm test
```

Documented Pages path (when Actions enabled): `/pledge/`.

## Honest scope

- Does **not** run Compact, a proof server, Lace transfers, or real ADA tips from this UI.
- Commitments and threshold “proofs” are **teaching stand-ins** — verify official Compact / Zswap crypto before shipping.
- Export JSON may include amounts, notes, and salts — treat downloads as sensitive.

## Flow

| Step | Teaching point |
|------|----------------|
| Seal | Amount + note + salt → commitment |
| Commit | Public hash on board; amount veiled |
| Threshold | Prove amount ≥ T without revealing exact tip |
| Disclose / re-seal | Full reveal or UI re-seal (theater) |
| Export / Import | Portable JSON snapshot across browsers/tabs |
| Multi-tab | Other tabs refresh when this tab saves |

Built by [@kshot9000](https://x.com/kshot9000).
