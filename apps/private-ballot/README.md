# Private Ballot Studio

Sealed polls & private votes for Midnight — **local-true** educational studio.

Public question + options · sealed ballot commits · nullifiers (anti-double-vote) · eligibility theater · tally / certify theater.

**Real local features:** `localStorage` persistence (schema v2), **multi-tab sync** (`BroadcastChannel` + `storage` events), **Export / Import JSON**, vitest for core helpers.

Starfield + aurora, keyboard shortcuts, donate dock (`@kshot9000` + Cardano addr). Honest **LOCAL-TRUE · not on-chain** labels — no Compact / Lace / ADA settlement claims.

## Run locally

```bash
cd apps/private-ballot
python3 -m http.server 5183
# open http://localhost:5183
```

Tests:

```bash
cd apps/private-ballot
npm install
npm test
```

Documented Pages path (when Actions enabled): `/ballot/`.

## Honest scope

- Does **not** run Compact, a proof server, Lace, or real ADA / DUST.
- Does **not** claim GitHub Pages is live until workflow scope + Actions are set.
- Commitments, nullifiers, and tally π blobs are **teaching stand-ins** — verify official Compact / Zswap crypto before shipping.
- Export JSON may include vote openings (secrets/salts) used for teaching — treat downloads as sensitive.

## Flow

| Step | Teaching point |
|------|----------------|
| Seal ballot | Public Q + options; eligibility salt → commit |
| Cast vote | Choice + secret → ballot commit + nullifier |
| Double-vote | Duplicate nullifier → REJECT (first-class) |
| Tally | Aggregate counts; openings stay local (sim) |
| Certify | Simulated π over commits + tallies |
| Disclose | Optional warn path — reveals choices locally |
| Export / Import | Portable JSON snapshot across browsers/tabs |
| Multi-tab | Other tabs refresh when this tab saves |

Built by [@kshot9000](https://x.com/kshot9000).
