# Midnight GrokBot Agent

**24/7 Midnight build lab** — scaffolding, Compact starters (incl. Agent Escrow), Lace connector kit, and a developer landing site for [Midnight](https://midnight.network/), the Cardano partner chain focused on **programmable privacy** with zero-knowledge smart contracts.

Built by [@kshot9000](https://x.com/kshot9000) (creator of [NightDream.io](https://nightdream.io)).

> This repo does **not** invent Midnight APIs. Prefer official docs and examples linked below.

## GitHub Pages (when Actions enabled)

Documented URL (may 404 until workflow scope + Pages source are set):
**https://kshot3000.github.io/Midnight-GrokBot-Agent/**

| Path | App |
| --- | --- |
| `/` | **Midnight Studio Hub** — flagship homepage, studio cards, live status, Compat Explorer |
| `/escrow/` | Agent Escrow local stub |
| `/lace/` | **Lace Connect Studio** — journey + matrix + capability radar |
| `/auth/` | **Auth Forge Studio** — MPS-0029 journey + scorecard + forge theater |
| `/board/` | **Shield Board** flagship — dual-state privacy bulletin |
| `/pledge/` | **Veil Pledge Studio** — private tip jar & pledge board |
| `/market/` | **Night Market Studio** — sealed listings & private bids |
| `/invite/` | **Sealed Invite Studio** — private RSVP & sealed invites |
| `/proof/` | **Proof Playground** — visual ZK / circuit explainer |
| `/ballot/` | **Private Ballot Studio** — sealed polls & private votes |
| `/passport/` | **Veil Passport Studio** — confidential credentials & selective disclosure |
| `/atelier/` | **Compact Atelier** — editable Compact snippets + explain panel |
| `/nocturne/` | **Nocturne Messenger** — private sealed DMs preview studio |

Pages workflow is ready at [`docs/pages.workflow.yml`](./docs/pages.workflow.yml) (copy to `.github/workflows/pages.yml`).
The lab OAuth token lacks the `workflow` scope, so CI cannot push the workflow file yet — add it once with a PAT that has **workflow** scope, then set **Settings → Pages → Source: GitHub Actions**.
Until then the URL may 404.

## What’s inside

```
.
├── apps/
│   ├── midnight-lab-site/     # Midnight Studio Hub (flagship homepage)
│   ├── lace-connect-demo/     # Lace Connect Studio (journey, matrix, capabilities)
│   ├── agent-escrow-stub/     # Local UI stub for Agent Escrow (no chain)
│   ├── auth-lab/              # Auth Forge Studio (MPS-0029 journey + scorecard)
│   ├── shield-board/          # Flagship dual-state privacy bulletin studio
│   ├── veil-pledge/           # Veil Pledge Studio — private tip jar & pledge board
│   ├── night-market/          # Night Market Studio — sealed listings & private bids
│   ├── sealed-invite/         # Sealed Invite Studio — private RSVP & sealed invites
│   ├── proof-playground/      # Proof Playground — visual ZK / circuit explainer
│   ├── private-ballot/        # Private Ballot Studio — sealed polls & private votes
│   ├── veil-passport/         # Veil Passport Studio — confidential credentials
│   ├── compact-atelier/       # Compact Atelier — editable snippets + explain panel
│   └── nocturne-messenger/    # Nocturne Messenger — sealed DMs preview studio
├── packages/
│   ├── lace-midnight-kit/     # Typed DApp connector helpers (official API types)
│   └── studio-craft/          # Canonical design tokens + donate dock (sync into apps)
├── contracts/
│   ├── hello-midnight/        # Compact counter starter
│   └── agent-escrow/          # Agent Escrow Compact skeleton (~0.31.1 notes)
├── BRANDING.md                # Canonical donation address + socials
├── LICENSE                    # MIT
└── README.md
```

| Path | Role |
| --- | --- |
| `apps/midnight-lab-site` | **Midnight Studio Hub** — starfield, studio gallery + live status, Compat Explorer, **⌘K command palette**, donate dock |
| `apps/lace-connect-demo` | **Lace Connect Studio** — real Lace discover/connect, localStorage prefs, reconnect, balances, health · **no transfers** |
| `apps/agent-escrow-stub` | Local state-machine UI stub for Agent Escrow (no Lace / no deploy) |
| `apps/auth-lab` | **Auth Forge Studio** — attack journey, scorecard, forge theater, local bboard |
| `apps/shield-board` | **Flagship** dual-state privacy bulletin — public commitments + private vault + selective disclose |
| `apps/veil-pledge` | **Veil Pledge Studio** — private tip jar, sealed pledges, threshold proofs (local stub) |
| `apps/night-market` | **Night Market Studio** — sealed listings, private bids, bid-threshold theater (local stub) |
| `apps/sealed-invite` | **Sealed Invite Studio** — private RSVP, capacity proofs, selective admit (local stub) |
| `apps/proof-playground` | **Proof Playground** — visual ZK circuits, witness→gate→prove theater (local stub) |
| `apps/private-ballot` | **Private Ballot Studio** — sealed polls, nullifiers, tally theater (local stub) |
| `apps/veil-passport` | **Veil Passport Studio** — confidential credentials, selective disclose, predicate theater (local stub) |
| `apps/compact-atelier` | **Compact Atelier** — editable Compact snippets, explain panel, lint theater (local stub) |
| `apps/nocturne-messenger` | **Nocturne Messenger Studio** — sealed DMs, envelope veil, selective reveal (local stub) |
| `packages/lace-midnight-kit` | **v0.3.0** — discover, connect, prefs, reconnect, balance refresh, health watch, capability probe, vitest |
| `packages/studio-craft` | Canonical `:root` tokens + donate dock / footer CSS (copy into apps for Pages) |
| `contracts/hello-midnight` | Commented Compact skeleton (compile after official toolchain install) |
| `contracts/agent-escrow` | Agent Escrow Compact skeleton — MPS-0029 auth, pragma ≥ 0.23, Compact **~0.31.1** notes |
| `BRANDING.md` | Donation address, X handle, NightDream mention |


## Local ports map (all studios)

Serve each app from its own folder (or assemble for Pages). Default lab ports:

| Port | App | Path (when assembled) | Command |
| --- | --- | --- | --- |
| **5173** | Midnight Studio Hub | `/` | `cd apps/midnight-lab-site && python3 -m http.server 5173` |
| **5174** | Lace Connect Studio | `/lace/` | `npm run dev:lace-demo` (Vite) |
| **5175** | Agent Escrow stub | `/escrow/` | `cd apps/agent-escrow-stub && python3 -m http.server 5175` |
| **5177** | Shield Board | `/board/` | `cd apps/shield-board && python3 -m http.server 5177` |
| **5176** | Auth Forge Studio | `/auth/` | `cd apps/auth-lab && python3 -m http.server 5176` |
| **5179** | Veil Pledge Studio | `/pledge/` | `cd apps/veil-pledge && python3 -m http.server 5179` |
| **5180** | Night Market Studio | `/market/` | `cd apps/night-market && python3 -m http.server 5180` |
| **5181** | Sealed Invite Studio | `/invite/` | `cd apps/sealed-invite && python3 -m http.server 5181` |
| **5182** | Proof Playground | `/proof/` | `cd apps/proof-playground && python3 -m http.server 5182` |
| **5183** | Private Ballot Studio | `/ballot/` | `cd apps/private-ballot && python3 -m http.server 5183` |
| **5184** | Veil Passport Studio | `/passport/` | `cd apps/veil-passport && python3 -m http.server 5184` |
| **5185** | Compact Atelier | `/atelier/` | `cd apps/compact-atelier && python3 -m http.server 5185` |
| **5186** | Nocturne Messenger | `/nocturne/` | `cd apps/nocturne-messenger && python3 -m http.server 5186` |

Hub status pills probe sibling paths on the **same origin** (assembled Pages artifact). Serving only the Hub on 5173 correctly reports **Not found** for siblings — that is honest, not a bug. Shared craft tokens live in [`packages/studio-craft/`](./packages/studio-craft/) (copied into each app’s CSS because Pages cannot resolve cross-package links).

## Quick start — Studio Hub (flagship homepage)

Documented Pages URL (may 404 until Actions / workflow scope enabled):
https://kshot3000.github.io/Midnight-GrokBot-Agent/

No npm required for local preview. From the repo root:

```bash
cd apps/midnight-lab-site
python3 -m http.server 5173
# open http://localhost:5173
```

Or open `apps/midnight-lab-site/index.html` directly in a browser. Sibling demos on Pages: [`/escrow/`](https://kshot3000.github.io/Midnight-GrokBot-Agent/escrow/), [`/lace/`](https://kshot3000.github.io/Midnight-GrokBot-Agent/lace/).

## Quick start — Lace Connect Studio (real Lace)

**Requires a browser.** Without Lace installed, the demo still loads and shows “no wallet”. With [Lace](https://www.lace.io/) + Midnight enabled, you can discover providers and connect (default network: **preprod**).

```bash
npm install
npm run dev:lace-demo
# open http://localhost:5174
```

Safety: the demo does **not** call `makeTransfer` / submit. A successful connect is **not** proof that mainnet transfers work.

## Quick start — Auth Forge Studio

MPS-0029 attack journey, scorecard, forge theater, local bulletin board.

```bash
cd apps/auth-lab
python3 -m http.server 5176
# open http://localhost:5176
```

Pages path (when Actions enabled): `/auth/`. Local stub only — no on-chain Compact deploy.

## Quick start — Shield Board (flagship)

Dual-state studio: public ledger commitments vs private vault bodies.

```bash
cd apps/shield-board
python3 -m http.server 5177
# open http://localhost:5177
```

Pages path (when Actions enabled): `/board/`. Local stub only — no on-chain Compact deploy.


## Quick start — Veil Pledge Studio

Private tip jar & pledge board: seal amounts, commit public hashes, prove thresholds without revealing exact tips.

```bash
cd apps/veil-pledge
python3 -m http.server 5179
# open http://localhost:5179
```

Pages path (when Actions enabled): `/pledge/`. Local stub only — no on-chain Compact deploy, no real ADA transfer from this UI.


## Quick start — Night Market Studio

Sealed listings & private bids: public titles + commitments, reserves and bid amounts in a vault, prove bid ≥ reserve without revealing either.

```bash
cd apps/night-market
python3 -m http.server 5180
# open http://localhost:5180
```

Pages path (when Actions enabled): `/market/`. Local stub only — no on-chain Compact deploy, no real settlement from this UI.

## Quick start — Sealed Invite Studio

Private RSVP: public event titles + commitments, capacity and guest identities in a vault, prove seats remain without revealing who.

```bash
cd apps/sealed-invite
python3 -m http.server 5181
# open http://localhost:5181
```

Pages path (when Actions enabled): `/invite/`. Local stub only — no on-chain Compact deploy, no real guest-list custody from this UI.



## Quick start — Private Ballot Studio

Sealed polls & private votes: public questions + ballot commitments, nullifiers against double-votes, tally theater that certifies counts without publishing openings.

```bash
cd apps/private-ballot
python3 -m http.server 5183
# open http://localhost:5183
```

Pages path (when Actions enabled): `/ballot/`. Local stub only — no on-chain Compact deploy, no real votes custody from this UI.

## Quick start — Veil Passport Studio

Confidential credentials & selective disclosure: seal claims into a commit, present a public surface, disclose only needed attributes, prove age ≥ N or membership ∈ set without revealing raw values.

```bash
cd apps/veil-passport
python3 -m http.server 5184
# open http://localhost:5184
```

Pages path (when Actions enabled): `/passport/`. Local stub only — no on-chain Compact deploy, no real credential custody from this UI.

## Quick start — Proof Playground

Visual ZK / circuit explainer: pick a circuit, set private witnesses, watch the graph light, run a simulated prove / verify theater.

```bash
cd apps/proof-playground
python3 -m http.server 5182
# open http://localhost:5182
```

Pages path (when Actions enabled): `/proof/`. Local stub only — no Compact runtime, proof server, or on-chain verify.


## Quick start — Compact Atelier

Editable Compact snippets + explain panel: load curated skeletons, annotate constructs, watch ledger vs witness rails, run a simulated lint theater.

```bash
cd apps/compact-atelier
python3 -m http.server 5185
# open http://localhost:5185
```

Pages path (when Actions enabled): `/atelier/`. Local stub only — not a Compact compiler, proof server, or on-chain deploy.

## Quick start — Nocturne Messenger Studio

Private sealed DMs preview: claim a handle, seal bodies in an envelope veil, publish commitments on the ledger rail, run selective reveal theater.

```bash
cd apps/nocturne-messenger
python3 -m http.server 5186
# open http://localhost:5186
```

Pages path (when Actions enabled): `/nocturne/`. Local stub only — not a relay, Lace, Compact compiler, or on-chain messaging.

## Compact / Midnight toolchain (official)

Do **not** rely on this repo to install Compact. Use Midnight’s guide:

1. **Install Compact + proof server** — https://docs.midnight.network/getting-started/installation  
2. **Compact language** — https://docs.midnight.network/compact  
3. **Language reference** — https://docs.midnight.network/compact/reference/compact-reference  
4. **Full-stack tutorial** — https://docs.midnight.network/tutorials/leaderboard/overview  
5. **Fund wallet (tNIGHT → tDUST)** — https://docs.midnight.network/guides/acquire-tokens  
6. **DApp connector (Lace)** — https://docs.midnight.network/api-reference/dapp-connector  
7. **React wallet connect** — https://docs.midnight.network/guides/react-wallet-connect  
8. **Connector API repo** — https://github.com/midnightntwrk/midnight-dapp-connector-api  

Wallet: [Lace](https://www.lace.io/) with Midnight network settings and a local proof server when developing locally.

See `contracts/README.md` for how this lab expects you to compile once Compact is on your `PATH`.

## Midnight concepts (high-level, from official materials)

- **Programmable privacy** — Compact smart contracts let you choose what stays private vs what is disclosed, backed by ZK proofs.
- **Dual-state model** — public ledger state on-chain + local private state that never leaves the client.
- **NIGHT** — native unshielded utility / governance token; registered holdings generate DUST.
- **DUST** — shielded, non-transferable resource used to pay transaction fees (testnets: **tNIGHT** / **tDUST**).
- **Cardano partner chain** — Midnight is positioned in the Cardano ecosystem as a privacy-focused partner / sidechain-style L1 for private DApps.

Always verify version pins (Compact, midnight-js, proof server, ledger) against Midnight’s **compatibility matrix** in the docs before deploying.

## Branding / support

Canonical copy lives in [`BRANDING.md`](./BRANDING.md).

- **Cardano donation:**  
  `addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v`
- **X:** [@kshot9000](https://x.com/kshot9000) — https://x.com/kshot9000
- **NightDream.io:** https://kshot3000.github.io/NightDream.io/ (custom domain `nightdream.io` pending DNS — see NightDream `docs/DNS.md`)

## License

MIT — see [`LICENSE`](./LICENSE). Official Midnight docs/examples may use their own licenses; when copying from Midnight Foundation materials, follow those upstream terms.

## Agent Escrow (Compact)

Milestone escrow for AI-agent work — Compact skeleton + local UI stub:

- Contract: [`contracts/agent-escrow/`](./contracts/agent-escrow/) (witness role commitments; **not** `ownPublicKey()` alone)
- UI stub: [`apps/agent-escrow-stub/`](./apps/agent-escrow-stub/) (`python3 -m http.server 5175`)
- Protocol reference (JS/Python): https://github.com/Kshot3000/Cardano-Midnight-Qwen-Builder/tree/main/apps/agent-escrow
- Compact port notes (sister): https://github.com/Kshot3000/Cardano-Midnight-Qwen-Builder/blob/main/apps/agent-escrow/COMPACT-PORT.md
- Audit log: [`contracts/AUDIT-NOTES.md`](./contracts/AUDIT-NOTES.md)

Pin Compact compiler **~0.31.1** (create-mn-app / example-bboard matrix). This lab has **not** deployed the escrow contract on-chain in the scaffold commit.

## Upstream sweep log

See [`docs/UPSTREAM-SWEEP-2026-09-25.md`](./docs/UPSTREAM-SWEEP-2026-09-25.md) for PRs/issues landed from this lab.

## Recommended next apps

1. Compile `contracts/agent-escrow` with Compact ~0.31.1, then wire witnesses like `example-bboard`.
2. Wire `contracts/hello-midnight` through the official Compact compile → TypeScript bindings flow.
3. Extend `apps/lace-connect-demo` with read-only Preprod indexer queries (still no transfer claims until proven).
4. Follow the official privacy-preserving leaderboard tutorial end-to-end, then adapt patterns here.
