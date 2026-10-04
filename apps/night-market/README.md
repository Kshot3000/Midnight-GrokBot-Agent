# Night Market Studio

Sealed listings & private bids for Midnight — **local-true** educational studio.

Public titles + commitment hashes · private reserves / bid amounts · prove bid ≥ reserve theater · award / disclose.

**Real local features:** `localStorage` persistence (schema v2), **multi-tab sync** (`BroadcastChannel` + `storage` events), **Export / Import JSON**, vitest for core helpers.

Starfield + aurora, donate dock (`@kshot9000` + Cardano addr). Honest **LOCAL-TRUE · not on-chain** labels — no Compact / Lace / ADA settlement claims.

## Run locally

```bash
cd apps/night-market
python3 -m http.server 5180
# open http://localhost:5180
```

Tests:

```bash
cd apps/night-market
npm install
npm test
```

Documented Pages path (when Actions enabled): `/market/`.

## Honest scope

- Does **not** run Compact, a proof server, Lace, or real ADA settlement.
- Listing/bid commitments and clearance “proofs” are **teaching stand-ins**.
- Export JSON may include reserves, bids, and salts — treat downloads as sensitive.
- Imported / stored state is sanitized on load: non-finite or negative amounts clamp to 0 (and a clamped amount can never pass the prove/award check), and drafts are fully typed before rendering.

## Flow

| Step | Teaching point |
|------|----------------|
| Seal listing | Reserve + details + salt → commitment |
| Open stall | Public title + hash on the board |
| Seal bid | Amount + listing id + salt → bid commitment |
| Prove | bid ≥ reserve without revealing numbers |
| Award / disclose | Winner path or full reveal (local) |
| Export / Import | Portable JSON snapshot |
| Multi-tab | Other tabs refresh when this tab saves |

Built by [@kshot9000](https://x.com/kshot9000).
