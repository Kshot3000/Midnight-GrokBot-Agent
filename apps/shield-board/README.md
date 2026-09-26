# Shield Board Studio

Flagship **dual-state** Midnight privacy bulletin — **local-true** educational studio.

Public ledger pane (commitments, owner pk, seq) · private vault (bodies until disclose) · witness-derived identity (MPS-0029).

**Real local features:** `localStorage` persistence (schema v2 + legacy migration), **multi-tab sync** (`BroadcastChannel` + `storage` events), **Export / Import JSON**, vitest for core helpers.

Donate dock (`@kshot9000` + Cardano addr) always visible. Honest **LOCAL-TRUE · not on-chain** labels — local persistence ≠ Compact deploy.

Inspired by [`example-bboard`](https://github.com/midnightntwrk/example-bboard).

## Run locally

```bash
cd apps/shield-board
python3 -m http.server 5177
# open http://localhost:5177
```

Tests:

```bash
cd apps/shield-board
npm install
npm test
```

Documented Pages path (when Actions enabled): `/board/`.

## Honest scope

- Does **not** run Compact, a proof server, or on-chain deploy.
- Wallet scan enumerates `window.midnight` only — **no** Lace `connect` / `makeTransfer` in this app.
- Export JSON includes local secret + private bodies — treat downloads as sensitive.

## Flow

| Step | Teaching point |
|------|----------------|
| Witness | Local secret → derived pk (MPS-0029) |
| Seal | Commit H(body ‖ pk ‖ seq ‖ domain); body stays vaulted |
| Disclose | Owner publishes body to public pane |
| Take-down | Owner removes; forged pk fails honestly |
| Export / Import | Portable JSON snapshot across browsers/tabs |
| Multi-tab | Other tabs refresh when this tab saves |

Built by [@kshot9000](https://x.com/kshot9000).
