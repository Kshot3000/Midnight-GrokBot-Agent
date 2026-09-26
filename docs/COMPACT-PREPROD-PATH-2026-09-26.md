# Compact → Preprod path — 2026-09-26 (CT)

Honest works-vs-blocked for **Midnight GrokBot Agent** lab box.
Repo: https://github.com/Kshot3000/Midnight-GrokBot-Agent (base `0698662` LOCAL-TRUE).
Brand: donate `addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v` · [@kshot9000](https://x.com/kshot9000).

## Compat snapshot (tracked)

| Piece | Pin | Verified on box? |
| --- | --- | --- |
| Compact CLI | 0.5.2 (installer) | **YES** — `~/.local/bin/compact` |
| Compact toolchain | **0.31.1** | **YES** — `compact compile +0.31.1 --version` |
| Compact language | **0.23.0** | **YES** — `--language-version` |
| Ledger (compiler) | **8.0.2** | **YES** — `--ledger-version` |
| compact-runtime | **0.16.0** | **YES** — `--runtime-version`; npm has `@midnight-ntwrk/compact-runtime@0.16.0` |
| midnight-js | **4.1.1** | npm latest **4.1.1** (not wired into an app this pass) |
| DApp Connector API | **4.0.1** | Lace kit **0.3.0** already uses it |
| proof-server image | **8.1.0** | Image tag exists on Docker Hub; **not run** here |
| create-mn-app | npm **0.5.1** | Not scaffolded (Node/Docker blockers) |

## What WORKS (real, this session)

1. **Compact installer** — after `apt install xz-utils` (installer unpacks `.tar.xz`).
   ```bash
   curl --proto '=https' --tlsv1.2 -LsSf \
     https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
   export PATH="$HOME/.local/bin:$PATH"
   ```
2. **Toolchain 0.31.1** — `compact update 0.31.1` hit GitHub **API rate limit**;
   worked around by direct asset download (not a fake compile):
   `compactc_v0.31.1_x86_64-unknown-linux-musl.zip` →
   `~/.compact/versions/0.31.1/x86_64-unknown-linux-musl/`.
3. **`hello-midnight` compile** — full ZK (prover+verifier keys):
   ```bash
   compact compile +0.31.1 contracts/hello-midnight/hello.compact contracts/hello-midnight/out
   ```
   Outputs: `contract/index.{js,d.ts}`, `zkir/increment.{zkir,bzkir}`, `keys/increment.{prover,verifier}`.
4. **`agent-escrow` compile** — full ZK, **12 circuits**, ~38MB managed tree:
   ```bash
   compact compile +0.31.1 contracts/agent-escrow/src/agent-escrow.compact \
     contracts/agent-escrow/src/managed/agent-escrow
   ```
5. **Source fixes required for Compact 0.23** (pushed in repo):
   - Uint widen casts: `(a + b) as Uint<64>` etc.
   - `assertIsApprover`: `disclose(roleCommitment(...))` before OR compare
     (explicit-disclosure / conditional branch rule).
6. Lace kit **0.3.0** + connector **4.0.1** unchanged — real connect when extension present.

## What is BLOCKED on this box

| Blocker | Detail |
| --- | --- |
| **No Docker / Podman** | Cannot run `docker run -p 6300:6300 midnightntwrk/proof-server:8.1.0 midnight-proof-server -v`. No local proof generation for txs / Lace local mode. |
| **Node v20.19.2** | `create-mn-app` + official quickstart want **Node 22+**. Not upgraded this pass. |
| **`compact update` API** | Unauthenticated GitHub API rate limit broke `compact update` / `compact list`; direct release zip still works. Prefer `GITHUB_TOKEN` for update, or pin zip. |
| **Default compiler marker** | Writing `~/.compact/default` as plain `0.31.1` did **not** satisfy CLI (“No default compiler set”). Always pass **`+0.31.1`** (npm scripts do). |
| **Pages live** | Workflow still only in `docs/pages.workflow.yml` — needs **workflow**-scoped PAT push + Settings → Pages → Actions. See `docs/PAGES-WORKFLOW-OAUTH.md`. **Do not claim Pages live.** |
| **On-chain / Preprod deploy** | Not attempted. No proof-server, no faucet funding, no midnight-js deploy client in this pass. |

## Exact next bar (honest)

1. On a Docker host: start proof-server **8.1.0**; Lace → Local `http://localhost:6300`.
2. Node 22+: optional `npx create-mn-app@latest` undeployed/preprod template, or wire
   `@midnight-ntwrk/compact-runtime@0.16.0` + midnight-js **4.1.1** witnesses to
   the generated `Contract` class from `managed/`.
3. Human: push `.github/workflows/pages.yml` with workflow-scoped PAT.

## Commands cheat-sheet (repo)

```bash
export PATH="$HOME/.local/bin:$PATH"
npm run compact:hello
npm run compact:escrow
# skip keys while iterating:
npm run compact:hello:skip-zk
npm run compact:escrow:skip-zk
```

## Non-claims

- No X posts.
- No fake “deployed to Preprod”.
- No “proof-server running on the box”.
- No “Pages is live”.
- Managed/out artifacts stay gitignored — regenerate locally.
