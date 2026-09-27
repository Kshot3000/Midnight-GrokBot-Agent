# Agent Escrow Studio

Milestone escrow **role theater** + **dual-state proof** UX for Midnight — **local-true** educational studio.

Act as Client / Agent / Approver · public commitment hashes vs private work notes · visual timeline + audit log.

**Real local features:** `localStorage` persistence (schema v2), **multi-tab sync** (`BroadcastChannel` + `storage` events), **Export / Import JSON**, vitest for core state machine, optional **Local ZK prove metrics** panel (loads `last-prove.json` from CLI or prove-bridge `:6399`).

Donate dock (`@kshot9000` + Cardano addr) always visible. Honest **LOCAL-TRUE · not on-chain** labels — local persistence ≠ Compact deploy. Local prove metrics are **REAL** vs proof-server `:6300` when loaded — still **NOT on-chain**.

## Run locally

```bash
cd apps/agent-escrow-stub
python3 -m http.server 5175
# open http://localhost:5175
```

Tests:

```bash
cd apps/agent-escrow-stub
npm install
npm test
```

Optional local prove metrics (REAL ZK vs `:6300` — still NOT on-chain):

```bash
# from repo root — writes apps/agent-escrow-stub/last-prove.json
npm run prove:escrow-local
# CORS bridge for Studio (port 6399)
npm run prove-bridge
# Studio → Load last local prove / Probe prove-bridge / Bridge prove initialize
```

Documented Pages path (when Actions enabled): `/escrow/`.

## Honest scope

- Role theater does **not** run Compact, Lace transfers, or real ADA / DUST settlement.
- Optional **Local ZK prove metrics** panel can load **REAL** CLI/bridge prove results (proof-server `:6300` via Node prove-bridge `:6399`) — that is still **local prove ≠ on-chain / ≠ Preprod deploy**.
- State machine + proof hashes in the theater are **teaching stand-ins** — verify official Compact / Zswap crypto before shipping.
- Export JSON may include private proof notes — treat downloads as sensitive.

## Flow

| Step | Teaching point |
|------|----------------|
| Fund / Start | Client funds 5 ADA (local units) and starts work |
| Proof m1 / m2 | Agent submits public H + private vault note |
| Release / Reject | Approver decides milestones (demo reject path on m2) |
| Settle / Dispute | Close escrow or branch into dispute → resume/refund |
| Export / Import | Portable JSON snapshot across browsers/tabs |
| Multi-tab | Other tabs refresh when this tab saves |

Compact skeleton: [`contracts/agent-escrow`](../../contracts/agent-escrow/)

Built by [@kshot9000](https://x.com/kshot9000).
