# Compact → Preprod path — 2026-09-26 (CT)

Honest works-vs-blocked for **Midnight GrokBot Agent** lab box.
Repo: https://github.com/Kshot3000/Midnight-GrokBot-Agent
Brand: donate `addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v` · [@kshot9000](https://x.com/kshot9000).

## Compat snapshot (tracked)

| Piece | Pin | Verified on box? |
| --- | --- | --- |
| Compact CLI | 0.5.2 (installer) | **YES** — `~/.local/bin/compact` |
| Compact toolchain | **0.31.1** | **YES** — `compact compile +0.31.1 --version` |
| Compact language | **0.23.0** | **YES** — `--language-version` |
| Ledger (compiler) | **8.0.2** | **YES** — `--ledger-version` |
| compact-runtime | **0.16.0** | **YES** — npm + generated `checkRuntimeVersion('0.16.0')` |
| midnight-js | **4.1.1** | **YES** — wired in `@kshot/preprod-hello-stub` |
| DApp Connector API | **4.0.1** | Lace kit **0.3.0** already uses it |
| proof-server image | **8.1.0** | **YES** — podman pull + run; `/health` → 200 |
| create-mn-app | npm **0.5.1** | CLI runs on Node 22; dry-run OK; full scaffold still wants Docker check |
| Node (fnm) | **22.23.3** | **YES** — user-space; system `/usr/bin/node` stays **v20.19.2** |
| Podman | **5.4.2** | **YES** — rootless; used for proof-server |

## What WORKS (real, this session)

1. **Node 22 via fnm (no system break)**
   ```bash
   curl -fsSL https://fnm.vercel.app/install | bash -s -- \
     --install-dir "$HOME/.local/share/fnm" --skip-shell
   export PATH="$HOME/.local/share/fnm:$PATH"
   eval "$(fnm env)"
   fnm install 22 && fnm default 22 && fnm use 22
   node -v   # v22.23.3
   /usr/bin/node -v   # still v20.19.2
   ```
   Persist in `~/.bashrc` (already done on box):
   ```bash
   export FNM_PATH="$HOME/.local/share/fnm"
   export PATH="$FNM_PATH:$PATH"
   eval "$(fnm env)"
   ```

2. **Compact compile** (unchanged from prior pass) — hello + agent-escrow with ZK keys.
   ```bash
   export PATH="$HOME/.local/bin:$PATH"
   npm run compact:hello
   npm run compact:escrow
   ```

3. **`@kshot/preprod-hello-stub`** — loads **real** `contracts/hello-midnight/out` artifacts:
   - `check:artifacts` — sizes for contract/keys/zkir (fails if missing)
   - `offchain` — `Contract({})` + `impureCircuits.increment` → greetings 0→1, proofData present
   - `preprod:config` — `setNetworkId('preprod')` + official endpoints (**config only**)
   - vitest: **4/4 pass**
   ```bash
   npm run stub:check
   npm run stub:offchain
   npm run stub:preprod-config
   npm run stub:test
   ```

4. **Podman + proof-server 8.1.0**
   ```bash
   sudo apt-get update
   sudo DEBIAN_FRONTEND=noninteractive apt-get install -y \
     -o Dpkg::Options::="--force-confold" -o Dpkg::Options::="--force-confdef" podman
   # Note: bare apt can hang on /etc/fuse.conf conffile prompt — use force-confold.
   podman pull docker.io/midnightntwrk/proof-server:8.1.0
   podman run -d --name midnight-proof-server -p 6300:6300 \
     docker.io/midnightntwrk/proof-server:8.1.0 midnight-proof-server -v
   curl -sS http://127.0.0.1:6300/health   # HTTP 200
   ```
   Lace Local → `http://localhost:6300`. Proof server sees witness data in the clear — keep local.

5. **create-mn-app 0.5.1** under Node 22:
   ```bash
   npx create-mn-app@0.5.1 --dry-run -y -t hello-world --skip-install --skip-git mn-hello-dry
   ```
   Dry-run lists template + “Check Docker availability”. Prefer our thin stub for artifact honesty;
   full `create-mn-app` scaffold is optional once Docker/Podman is present.

## What is still BLOCKED / NOT claimed

| Item | Detail |
| --- | --- |
| **On-chain Preprod deploy** | Not attempted. Need funded + DUST-registered wallet + `deployContract` providers. |
| **Pages live** | Workflow still only in `docs/pages.workflow.yml` — needs workflow-scoped PAT. |
| **`compact update` API** | Unauthenticated GitHub rate limit; use direct zip or `GITHUB_TOKEN`. |
| **Root engines `>=22`** | Advisory for stub/midnight-js path; Lace kit still declares `>=18`. Activate fnm Node 22 before stub scripts. |

## Exact next bar (honest)

1. Fund Preprod wallet (Lace / mnemonic) + register for tDUST generation.
2. Wire midnight-js **providers** (indexer / node / http proof provider → `:6300`) and call
   `deployContract` from `@midnight-ntwrk/midnight-js-contracts` against compiled hello.
3. Optional: `npx create-mn-app@0.5.1 -y -t hello-world` into a sibling dir for upstream parity.

## Commands cheat-sheet

```bash
export PATH="$HOME/.local/bin:$HOME/.local/share/fnm:$PATH"
eval "$(fnm env)" && fnm use 22

npm run compact:hello
npm run stub:offchain
npm run stub:test

# proof-server (foreground)
npm run proof-server:podman
# or detached:
podman run -d --name midnight-proof-server -p 6300:6300 \
  docker.io/midnightntwrk/proof-server:8.1.0 midnight-proof-server -v
```

## Non-claims

- No X posts.
- No fake “deployed to Preprod”.
- No “Pages is live”.
- Managed/out artifacts stay gitignored — regenerate locally.
- Off-chain increment ≠ chain submit.

---

## Update — Preprod deploy scaffold (2026-09-26 ~00:43 CT)

Landed in `@kshot/preprod-hello-stub` + repo root:

- Providers wiring (`stub:providers`) — indexer/node/proof probes green; wallet slots null until funded seed
- `.env.preprod.example` + clear-fail `stub:require-wallet` / `stub:deploy-preprod`
- Throwaway wallet gen → `.secrets/` (gitignored); faucet attempt fails without captcha (expected)
- Funding guide: [`docs/PREPROD-FUNDING.md`](./PREPROD-FUNDING.md)

**Still NOT claimed:** on-chain Preprod deploy / funded faucet credit.


---

## Update — Local ZK prove vs :6300 (2026-09-26 ~00:49 CT)

**Real progress:** circuit-level ZK prove for hello `increment` against local proof-server — **no wallet required**.

### What landed

| Item | Detail |
| --- | --- |
| Script | `npm run prove:hello-local` → `@kshot/preprod-hello-stub` `src/prove-hello-local.mjs` |
| API path | `proofDataIntoSerializedPreimage(input,output,publicTranscript,privateTranscriptOutputs,keyLocation)` → `httpClientProvingProvider` → `POST /check` + `POST /prove` |
| ZK config | `NodeZkConfigProvider(contracts/hello-midnight/out)` |
| Measured | greetings 0→1 · preimage 83 B · check ~9–22 ms · **proof 2940 B · prove ~37–502 ms** |
| Tests | vitest **11/11** (live prove skips only if `:6300` down) |
| Packaging | `contracts/ARTIFACT-CONSUMERS.md` + `npm run artifacts:list` (hello + escrow 12 circuits) |

### Success criteria (`prove:hello-local`)

1. `GET http://127.0.0.1:6300/health` → 200 / `status: ok`
2. Compiled hello artifacts present (`keys/increment.prover` etc.)
3. Off-chain `increment` greetings **0 → 1**
4. Serialized preimage `byteLength > 0`
5. `/check` returns binding-slot array
6. `/prove` returns `Uint8Array` with `proofBytes > 0` (hello typical **2940**)
7. Report claim string includes **NOT a Preprod deploy**

Exit **3** if proof-server unhealthy; **1** on artifact/runtime failure; **0** on success.

### Still NOT claimed

| Item | Status |
| --- | --- |
| On-chain Preprod deploy | **no** — faucet still captcha-blocked; wallet slots null |
| `proveTx` / `deployContract` | **not used** — this path is circuit `/prove` only |
| Funded tNIGHT / tDUST | **blocked** |
| X posts | **none** |

### Exact API gap for chain submit

Local prove uses **ProvingProvider** (`/check`, `/prove`). On-chain still needs:

1. Funded wallet + DUST registration
2. `walletProvider` + `midnightProvider` (WalletFacade)
3. `createUnprovenDeployTx` / `deployContract` (or call tx) → `proofProvider.proveTx(unprovenTx)` → submit

See [`ARTIFACT-CONSUMERS.md`](../contracts/ARTIFACT-CONSUMERS.md) and [`PREPROD-FUNDING.md`](./PREPROD-FUNDING.md).

### Cheat-sheet add

```bash
export PATH="$HOME/.local/share/fnm:$PATH"
eval "$(fnm env)" && fnm use 22
curl -sS http://127.0.0.1:6300/health
npm run prove:hello-local
npm run artifacts:list
npm run stub:test
```


---

## Update — Agent-escrow local ZK prove vs :6300 (2026-09-26 ~00:55 CT)

**Real progress:** circuit-level ZK prove for agent-escrow **`initialize`** against local proof-server — **synthetic witness only, no funded wallet**.

### What landed

| Item | Detail |
| --- | --- |
| Script | `npm run prove:escrow-local` → `src/prove-escrow-local.mjs` |
| Artifact gate | `npm run stub:check-escrow` / `check:escrow-artifacts` |
| Circuit | `initialize(agentCommitment, approverCommitment)` |
| Witness | `localSecretKey` → lab RNG `Bytes<32>` (client role); commitments via `pureCircuits.roleCommitment` |
| ZK config | `NodeZkConfigProvider(contracts/agent-escrow/src/managed/agent-escrow)` |
| Measured (lab) | preimage **786** B · check ~**24** ms · **proof 4508** B · prove ~**1.1** s |
| Tests | vitest escrow smoke (live prove when `:6300` + artifacts present) |
| Docs | `contracts/ARTIFACT-CONSUMERS.md` + this file |

### Success criteria (`prove:escrow-local`)

1. `GET http://127.0.0.1:6300/health` → 200 / `status: ok`
2. 12 impure circuit keys present under managed tree
3. Off-chain `initialize` sets non-empty distinct `clientPk` / `agentPk`
4. Serialized preimage `byteLength > 0`
5. `/check` returns binding-slot array
6. `/prove` returns `Uint8Array` with `proofBytes > 0` (initialize typical **~4508**)
7. Report claim string includes **NOT a Preprod deploy**; `witness.fundedWallet === false`

Exit **3** if proof-server unhealthy; **1** on artifact/runtime failure; **0** on success.

### Partial scope (honest)

| Proved | Not proved in this script |
| --- | --- |
| `initialize` | `fund`, `addMilestone`, `start`, `submitProof`, `approve`, `reject`, `dispute`, `resolve*`, `settle`, `cancel` |

Later circuits need **role-matching** secrets (client / agent / approver) that hash to the commitments registered at `initialize`. Pure helpers (`roleCommitment`, `*Tag`) have **no** `.prover` / `.zkir` — cannot `/prove` them.

### Still NOT claimed

| Item | Status |
| --- | --- |
| On-chain Preprod deploy | **no** |
| Funded tNIGHT / tDUST | **blocked** (faucet captcha) |
| Full 12-circuit lifecycle smoke | **partial** — initialize only |
| X posts | **none** |

### Cheat-sheet add

```bash
export PATH="$HOME/.local/share/fnm:$PATH"
eval "$(fnm env)" && fnm use 22
curl -sS http://127.0.0.1:6300/health
npm run stub:check-escrow
npm run prove:escrow-local
npm run prove:hello-local
npm run stub:test
```
