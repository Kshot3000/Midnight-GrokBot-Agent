# Private Ballot Studio

Sealed polls & private votes for Midnight — educational **local stub**.

Public question + options · sealed ballot commits · nullifiers (anti-double-vote) · eligibility theater · tally / certify theater.
Starfield + aurora, keyboard shortcuts, donate dock (`@kshot9000` + Cardano addr), honest **LOCAL STUB · not on-chain** labels.

## Run locally

```bash
cd apps/private-ballot
python3 -m http.server 5183
# open http://localhost:5183
```

Documented Pages path (when Actions enabled): `/ballot/`.

## Honest scope

- Does **not** run Compact, a proof server, Lace, or real ADA / DUST.
- Does **not** claim GitHub Pages is live until workflow scope + Actions are set.
- Commitments, nullifiers, and tally π blobs are **teaching stand-ins** — verify official Compact / Zswap crypto before shipping.

## Flow

| Step | Teaching point |
|------|----------------|
| Seal ballot | Public Q + options; eligibility salt → commit |
| Cast vote | Choice + secret → ballot commit + nullifier |
| Double-vote | Duplicate nullifier → REJECT (first-class) |
| Tally | Aggregate counts; openings stay local (sim) |
| Certify | Simulated π over commits + tallies |
| Disclose | Optional warn path — reveals choices locally |

Built by [@kshot9000](https://x.com/kshot9000).
