# Sealed Invite Studio

Private RSVP & sealed invites for Midnight — **local-true** educational studio.

Public event titles + commitment hashes · private capacity / venue / guests · prove seats remain theater · admit / disclose.

**Real local features:** `localStorage` persistence (schema v2), **multi-tab sync** (`BroadcastChannel` + `storage` events), **Export / Import JSON**, vitest for core helpers.

Starfield + aurora, donate dock (`@kshot9000` + Cardano addr). Honest **LOCAL-TRUE · not on-chain** labels — no Compact / Lace / ADA settlement claims.

## Run locally

```bash
cd apps/sealed-invite
python3 -m http.server 5181
# open http://localhost:5181
```

Tests:

```bash
cd apps/sealed-invite
npm install
npm test
```

Documented Pages path (when Actions enabled): `/invite/`.

## Honest scope

- Does **not** run Compact, a proof server, Lace, or real on-chain RSVP.
- Invite/RSVP commitments and capacity “proofs” are **teaching stand-ins**.
- Export JSON may include capacity, venue, and guest names — treat downloads as sensitive.

## Flow

| Step | Teaching point |
|------|----------------|
| Seal invite | Capacity + venue + salt → commitment |
| Open invite | Public title + hash on the board |
| Seal RSVP | Name + plus-ones + salt → RSVP commitment |
| Prove | Seats remain under capacity without revealing who |
| Admit / disclose | Selective admit or full reveal (local) |
| Export / Import | Portable JSON snapshot |
| Multi-tab | Other tabs refresh when this tab saves |

Built by [@kshot9000](https://x.com/kshot9000).
