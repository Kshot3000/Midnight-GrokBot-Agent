# Midnight GrokBot Agent

**24/7 Midnight build lab** — scaffolding, Compact starters (incl. Agent Escrow), Lace connector kit, and a developer landing site for [Midnight](https://midnight.network/), the Cardano partner chain focused on **programmable privacy** with zero-knowledge smart contracts.

Built by [@kshot9000](https://x.com/kshot9000) (creator of [NightDream](https://nightdream.xyz)).

> This repo does **not** invent Midnight APIs. Prefer official docs and examples linked below.

## GitHub Pages — LIVE

**https://kshot3000.github.io/Midnight-GrokBot-Agent/** — live since 2026-10-02,
deployed from the `gh-pages` branch (legacy branch source). The site is
assembled by [`scripts/build-pages-site.sh`](./scripts/build-pages-site.sh)
(runtime files only — no tests, manifests, or node_modules) after building the
Lace demo with `PAGES_BASE=/Midnight-GrokBot-Agent/lace/`. To redeploy: run
those two steps, then publish the assembled `site/` to `gh-pages`.
An Actions workflow is also staged at [`docs/pages.workflow.yml`](./docs/pages.workflow.yml)
for a future move to CI deploys — it cannot be pushed yet because the lab
OAuth token lacks the `workflow` scope (see
[`docs/PAGES-WORKFLOW-OAUTH.md`](./docs/PAGES-WORKFLOW-OAUTH.md)).

| Path | App |
| --- | --- |
| `/` | **Midnight Studio Hub** — flagship homepage, studio cards, live status, Compat Explorer |
| `/hello/` | **Hello Studio** — local ZK prove metrics for hello.compact |
| `/escrow/` | **Agent Escrow Studio** — role theater (LOCAL-TRUE) |
| `/lace/` | **Lace Connect Studio** — journey + matrix + capability radar |
| `/auth/` | **Auth Forge Studio** — MPS-0029 journey + scorecard (LOCAL-TRUE) |
| `/board/` | **Shield Board** flagship — dual-state privacy bulletin |
| `/pledge/` | **Veil Pledge Studio** — private tip jar & pledge board |
| `/market/` | **Night Market Studio** — sealed listings & bids (LOCAL-TRUE) |
| `/invite/` | **Sealed Invite Studio** — private RSVP (LOCAL-TRUE) |
| `/proof/` | **Proof Playground** — visual ZK / circuit explainer |
| `/ballot/` | **Private Ballot Studio** — sealed polls & private votes |
| `/passport/` | **Veil Passport Studio** — confidential credentials & selective disclosure |
| `/atelier/` | **Compact Atelier** — editable Compact snippets + explain panel |
| `/nocturne/` | **Nocturne Messenger Studio** — sealed DMs (LOCAL-TRUE) |

## What’s inside

```
.
├── apps/
│   ├── midnight-lab-site/     # Midnight Studio Hub (flagship homepage)
│   ├── lace-connect-demo/     # Lace Connect Studio (journey, matrix, capabilities)
│   ├── hello-studio/          # Hello Studio — local ZK prove metrics (hello.compact)
│   ├── agent-escrow-stub/     # Local UI stub for Agent Escrow (no chain)
│   ├── auth-lab/              # Auth Forge Studio LOCAL-TRUE (MPS-0029)
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
│   ├── prove-metrics/         # Shared local ZK prove metrics (hello+escrow; sync into apps)
│   ├── studio-craft/          # Canonical design tokens + donate dock (sync into apps)
│   └── preprod-hello-stub/    # Off-chain Compact artifacts + midnight-js 4.1.1 (NOT a deploy)
├── contracts/
│   ├── hello-midnight/        # Compact counter starter (compile → out/)
│   └── agent-escrow/          # Agent Escrow Compact skeleton (~0.31.1)
├── docs/
│   ├── COMPACT-PREPROD-PATH-2026-09-26.md
│   └── PREPROD-FUNDING.md          # faucet + DUST registration (verified docs URLs)
├── .env.preprod.example            # wallet/endpoints template (no secrets)
├── BRANDING.md                # Canonical donation address + socials
├── LICENSE                    # MIT
└── README.md
```

| Path | Role |
| --- | --- |
| `apps/midnight-lab-site` | **Midnight Studio Hub** — starfield, studio gallery + live status, Compat Explorer, **⌘K command palette**, donate dock |
| `apps/lace-connect-demo` | **Lace Connect Studio** — real Lace discover/connect, localStorage prefs, reconnect, balances, health · **no transfers** |
| `apps/hello-studio` | **LOCAL prove** Hello Studio — `prove:hello-local` metrics panel (`last-prove.json` / prove-bridge `:6399` `POST /prove?contract=hello`), shared `@kshot/prove-metrics`, vitest · not on-chain |
| `apps/agent-escrow-stub` | **LOCAL-TRUE** escrow role theater — localStorage v2, multi-tab sync, export/import, optional local ZK prove metrics (`last-prove.json` / prove-bridge `:6399`, path selector), shared `@kshot/prove-metrics`, vitest · not on-chain |
| `apps/auth-lab` | **LOCAL-TRUE** Auth Forge — localStorage v2, multi-tab sync, export/import, vitest · MPS-0029 · not on-chain |
| `apps/shield-board` | **LOCAL-TRUE** dual-state bulletin — localStorage v2, multi-tab sync, export/import, vitest · not on-chain |
| `apps/veil-pledge` | **LOCAL-TRUE** Veil Pledge — localStorage v2, multi-tab sync, export/import, vitest · not on-chain |
| `apps/night-market` | **LOCAL-TRUE** Night Market — localStorage v2, multi-tab sync, export/import, vitest · sealed listings & bids · not on-chain |
| `apps/sealed-invite` | **LOCAL-TRUE** Sealed Invite — localStorage v2, multi-tab sync, export/import, vitest · private RSVP · not on-chain |
| `apps/proof-playground` | **LOCAL-TRUE** Proof Playground — localStorage v2, multi-tab sync, export/import, vitest · not a proof server |
| `apps/private-ballot` | **LOCAL-TRUE** sealed polls — localStorage v2, multi-tab sync, export/import, vitest · educational hashes only |
| `apps/veil-passport` | **LOCAL-TRUE** Veil Passport — localStorage v2, multi-tab sync, export/import, vitest · not on-chain |
| `apps/compact-atelier` | **LOCAL-TRUE** Compact Atelier — localStorage lesson progress, multi-tab sync, export/import, vitest · not a Compact compiler |
| `apps/nocturne-messenger` | **LOCAL-TRUE** Nocturne Messenger — localStorage v2, multi-tab sync, export/import, vitest · sealed DMs · not a relay / not on-chain |
| `packages/lace-midnight-kit` | **v0.3.0** — discover, connect, prefs, reconnect, balance refresh, health watch, capability probe, vitest |
| `packages/studio-craft` | Canonical `:root` tokens + donate dock / footer CSS (copy into apps for Pages) |
| `packages/prove-metrics` | **@kshot/prove-metrics** — shared hello+escrow local ZK prove metrics helpers (sync into apps for Pages) |
| `packages/preprod-hello-stub` | Preprod path — off-chain hello + **providers wiring** + clear-fail deploy gate · banners + exit-code legend · **not a confirmed Preprod deploy** |
| Hub `#preprod` panel | Honest Compact / proof-server `:6300` + prove-bridge `:6399` live probes (soft-fail) / **hello DEPLOYED + increment called** on Preprod (live contract address) |
| `@kshot/lace-midnight-kit` | **0.3.1** — install guide + `ERROR_CATALOG` surfaced in Lace Connect Studio |
| `contracts/hello-midnight` | Compact counter — `npm run compact:hello` (artifacts gitignored) |
| `contracts/agent-escrow` | Agent Escrow Compact skeleton — MPS-0029 auth, pragma ≥ 0.23, Compact **~0.31.1** notes |
| `BRANDING.md` | Donation address, X handle, NightDream mention |


## Local ports map (all studios)

Serve each app from its own folder (or assemble for Pages). Default lab ports:

| Port | App | Path (when assembled) | Command |
| --- | --- | --- | --- |
| **5173** | Midnight Studio Hub | `/` | `cd apps/midnight-lab-site && python3 -m http.server 5173` |
| **5174** | Lace Connect Studio | `/lace/` | `npm run dev:lace-demo` (Vite) |
| **5175** | Agent Escrow Studio | `/escrow/` | `cd apps/agent-escrow-stub && python3 -m http.server 5175` |
| **5187** | Hello Studio | `/hello/` | `cd apps/hello-studio && python3 -m http.server 5187` |
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

Hub status pills probe sibling paths on the **same origin** (assembled Pages artifact). Serving only the Hub on 5173 correctly reports **Not found** for siblings — that is honest, not a bug. Shared craft tokens live in [`packages/studio-craft/`](./packages/studio-craft/) (copied into each app’s CSS because Pages cannot resolve cross-package links). Shared prove metrics live in [`packages/prove-metrics/`](./packages/prove-metrics/) — sync with `npm run sync:prove-metrics` into Hello + Escrow Studios.

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

MPS-0029 attack journey, scorecard, forge theater, local bulletin board — **LOCAL-TRUE** persist + sync + export/import.

```bash
cd apps/auth-lab
python3 -m http.server 5176
# open http://localhost:5176
```

```bash
cd apps/auth-lab && npm install && npm test
```

Pages path (when Actions enabled): `/auth/`. LOCAL-TRUE — not on-chain Compact / Lace settlement.

## Quick start — Shield Board (flagship)

Dual-state studio: public ledger commitments vs private vault bodies.

```bash
cd apps/shield-board
python3 -m http.server 5177
# open http://localhost:5177
```

Pages path (when Actions enabled): `/board/`. LOCAL-TRUE — not on-chain Compact / Lace settlement.


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

Pages path (when Actions enabled): `/nocturne/`. **LOCAL-TRUE** — localStorage v2, multi-tab sync, export/import; not a relay, Lace, Compact compiler, or on-chain messaging.

## Compact / Midnight toolchain (official)

**Lab status (2026-09-26 CT):** Compact **CLI 0.5.2** + toolchain **0.31.1** (lang **0.23.0**, ledger **8.0.2**, runtime **0.16.0**) on the build box. Hello + agent-escrow **compiled with proving keys**. Node **22.23.3** via fnm (system Node 20 untouched). Proof-server **8.1.0** healthy on `:6300` (Podman). Preprod **providers scaffold** + clear-fail deploy gate landed — **no on-chain deploy claimed**. See [`contracts/README.md`](./contracts/README.md), [`docs/PREPROD-FUNDING.md`](./docs/PREPROD-FUNDING.md), and [docs/COMPACT-PREPROD-PATH-2026-09-26.md](./docs/COMPACT-PREPROD-PATH-2026-09-26.md).

```bash
# After Compact is on PATH (install guide below):
npm run compact:hello    # → contracts/hello-midnight/out/ (gitignored)
npm run compact:escrow   # → contracts/agent-escrow/src/managed/ (gitignored)
```

Official guides (do not invent APIs):

1. **Install Compact + proof server** — https://docs.midnight.network/getting-started/installation  
2. **Compact language** — https://docs.midnight.network/compact  
3. **Language reference** — https://docs.midnight.network/compact/reference/compact-reference  
4. **Full-stack tutorial** — https://docs.midnight.network/tutorials/leaderboard/overview  
5. **Fund wallet (tNIGHT → tDUST)** — https://docs.midnight.network/guides/acquire-tokens  
6. **DApp connector (Lace)** — https://docs.midnight.network/api-reference/dapp-connector  
7. **React wallet connect** — https://docs.midnight.network/guides/react-wallet-connect  
8. **Connector API repo** — https://github.com/midnightntwrk/midnight-dapp-connector-api  
9. **create-mn-app** — https://github.com/midnightntwrk/create-mn-app (Node 22+, Docker Compose v2)

Wallet: [Lace](https://www.lace.io/) with Midnight network settings and a local proof server when developing locally.

Compat snapshot this lab tracks: Compact **~0.31.1** / lang **~0.23**, midnight-js **4.1.1**, DApp Connector **4.0.1**, proof-server **8.1.0**. Re-check Midnight’s compatibility matrix before deploy.

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
- **NightDream:** https://nightdream.xyz/ (live custom domain; `nightdream.io` is NXDOMAIN — see `contracts/AUDIT-NOTES.md`)

## License

MIT — see [`LICENSE`](./LICENSE). Official Midnight docs/examples may use their own licenses; when copying from Midnight Foundation materials, follow those upstream terms.

## Agent Escrow (Compact)

Milestone escrow for AI-agent work — Compact skeleton + **LOCAL-TRUE** studio:

- Contract: [`contracts/agent-escrow/`](./contracts/agent-escrow/) (witness role commitments; **not** `ownPublicKey()` alone)
- Studio: [`apps/agent-escrow-stub/`](./apps/agent-escrow-stub/) — localStorage v2, multi-tab sync, export/import, local prove metrics panel (`python3 -m http.server 5175`; `npm run prove-bridge`)
- Protocol reference (JS/Python): https://github.com/Kshot3000/Cardano-Midnight-Qwen-Builder/tree/main/apps/agent-escrow
- Compact port notes (sister): https://github.com/Kshot3000/Cardano-Midnight-Qwen-Builder/blob/main/apps/agent-escrow/COMPACT-PORT.md
- Audit log: [`contracts/AUDIT-NOTES.md`](./contracts/AUDIT-NOTES.md)

Pin Compact compiler **~0.31.1** (create-mn-app / example-bboard matrix). **Compiled** on the lab box with 0.31.1 (managed artifacts gitignored). **Not** deployed on-chain.

## Upstream sweep log

See [`docs/UPSTREAM-SWEEP-2026-09-25.md`](./docs/UPSTREAM-SWEEP-2026-09-25.md) for PRs/issues landed from this lab.

Wallet SDK reference gap (midnight-docs#831, page now published, generated index still open): [`docs/WALLET-SDK-REFERENCE-GAP.md`](./docs/WALLET-SDK-REFERENCE-GAP.md).

## Recommended next apps

1. ~~Compile escrow / hello with Compact ~0.31.1~~ **done**.
2. ~~Wire compact-runtime + off-chain circuits~~ **done** — `@kshot/preprod-hello-stub` (`npm run stub:offchain` · `prove:hello-local` · `prove:escrow-local`).
3. ~~Proof-server 8.1.0~~ **done on lab box via Podman** (`npm run proof-server:podman` / Lace Local `:6300`).
4. ~~Preprod providers scaffold + clear-fail deploy gate~~ **done** (`stub:providers` / `stub:deploy-preprod`).
5. **Next (Kshot):** fund Preprod wallet (faucet captcha) + tDUST registration, then real `deployContract` — claim only after tx confirm.
6. Optional: `npx create-mn-app@0.5.1 -y -t hello-world` on Node 22+ for upstream parity.

## Compact → Preprod (honest lab path)

See **[`docs/COMPACT-PREPROD-PATH-2026-09-26.md`](./docs/COMPACT-PREPROD-PATH-2026-09-26.md)** and **[`docs/PREPROD-FUNDING.md`](./docs/PREPROD-FUNDING.md)**.

| Step | Command / note |
| --- | --- |
| Node 22 (fnm; keeps system Node 20) | `fnm install 22 && fnm use 22` |
| Compile hello + ZK keys | `npm run compact:hello` |
| Off-chain stub (real artifacts) | `npm run stub:offchain` · `prove:hello-local` · `prove:escrow-local` / `npm run stub:test` |
| Proof-server 8.1.0 (reuse if healthy) | `curl -sS http://127.0.0.1:6300/health` or `npm run proof-server:podman` |
| Providers wiring + probes | `npm run stub:providers` |
| Env template | `cp .env.preprod.example .env.preprod` |
| Throwaway wallet (secrets gitignored) | `npm run stub:wallet-gen` |
| Faucet attempt (needs captcha) | `npm run stub:faucet-attempt` — browser: https://midnight-tmnight-preprod.nethermind.dev/ |
| Deploy gate (fails without keys) | `npm run stub:require-wallet` / `npm run stub:deploy-preprod` |

### Support / brand

- **Donate (Cardano):** `addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v`
- **X:** [@kshot9000](https://x.com/kshot9000)

**Not claimed:** on-chain Preprod deploy success, Pages live, X posts from this pass.

## Local prove (2026-09-27)

```bash
npm run smoke:local-prove   # health + hello + escrow initialize — soft-fail if :6300 down — NOT Preprod
npm run prove:hello-local   # hello increment ZK vs http://127.0.0.1:6300 — NOT Preprod deploy
npm run prove:escrow-local  # agent-escrow multi-circuit (happy) + synthetic roles — writes last-prove.json — NOT Preprod deploy
npm run prove:escrow-all    # all 12 impure circuits via named paths — NOT Preprod deploy
npm run prove-bridge        # CORS bridge :6399 for Agent Escrow Studio local-prove panel — NOT on-chain
npm run artifacts:list      # hello + escrow compiled artifact inventory
```

Copy-paste smoke for all paths + create-mn-app dry-run (Node 22 fnm): `contracts/ARTIFACT-CONSUMERS.md`.  
Also: `docs/COMPACT-PREPROD-PATH-2026-09-26.md`.

