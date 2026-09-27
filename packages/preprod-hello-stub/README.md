# @kshot/preprod-hello-stub

Thin **honest** Preprod path for Midnight GrokBot Agent — Compact artifacts, midnight-js **4.1.1** providers wiring, clear-fail deploy gate.

Brand: donate `addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v` · [@kshot9000](https://x.com/kshot9000)

## What this is

- Loads **real** `contracts/hello-midnight/out` artifacts from `compact compile +0.31.1`
- Pins compact-runtime **0.16.0** + midnight-js **4.1.1** (+ provider packages)
- Off-chain `increment` via generated `Contract`
- Preprod endpoints / `setNetworkId('preprod')` + **providers assembly** (indexer / zk / proof)
- Scripts that **exit non-zero** without wallet keys (no pretend deploy)
- Throwaway wallet generator (secrets → `.secrets/`, never commit)
- Human-scannable CLI banners + JSON reports on every command

## What this is NOT

- Not a confirmed Preprod on-chain deploy
- Not a captcha-free faucet (browser required)
- Not a substitute for local proof-server on `:6300`

## Quick start (Node 22+)

```bash
export PATH="$HOME/.local/share/fnm:$PATH"
eval "$(fnm env)" && fnm use 22

# 1) Confirm Compact artifacts
npm run check:artifacts -w @kshot/preprod-hello-stub

# 2) Off-chain increment (local circuit)
npm run offchain -w @kshot/preprod-hello-stub

# 3) Print Preprod endpoints
npm run preprod:config -w @kshot/preprod-hello-stub

# 4) Assemble providers + live probes (indexer / node / :6300)
npm run preprod:providers -w @kshot/preprod-hello-stub

# 5) Wallet gate (exits 2 without keys)
npm run preprod:require-wallet -w @kshot/preprod-hello-stub

# 6) Deploy gate (honest stops — see exit codes)
npm run preprod:deploy -w @kshot/preprod-hello-stub

npm test -w @kshot/preprod-hello-stub
```

Root aliases: `stub:check`, `stub:offchain`, `stub:preprod-config`, `stub:providers`, `stub:require-wallet`, `stub:wallet-gen`, `stub:faucet-attempt`, `stub:deploy-preprod`, `stub:test`.

## Local ZK prove (no wallet)

Against a healthy proof-server on `:6300` — circuit `/check` + `/prove` only:

```bash
curl -sS http://127.0.0.1:6300/health
npm run prove:hello-local -w @kshot/preprod-hello-stub
# root alias: npm run prove:hello-local
```

Success: greetings 0→1, preimage >0 B, proofBytes ≈2940, claim **NOT a Preprod deploy**.
Exit 3 if proof-server down. Does **not** call `deployContract` / `proveTx`.

## Local ZK prove — agent-escrow multi-circuit (no wallet)

Synthetic **client / agent / approver** secrets + role-swapping `localSecretKey`.
Default path **`happy`**: initialize → addMilestone → fund → start → submitProof → approve → settle.

```bash
curl -sS http://127.0.0.1:6300/health
npm run check:escrow-artifacts -w @kshot/preprod-hello-stub
npm run prove:escrow-local -w @kshot/preprod-hello-stub          # path=happy
node src/prove-escrow-local.mjs --path=initialize                # single step
node src/prove-escrow-local.mjs --path=cancel                    # initialize→fund→cancel
npm run prove:escrow-all -w @kshot/preprod-hello-stub            # all named paths → 12 circuits
# root aliases: npm run stub:check-escrow · prove:escrow-local · prove:escrow-all
```

Named paths: `initialize` · `happy` · `reject` · `dispute-refund` · `dispute-resume` · `cancel` · `all`.

Success: each step proofBytes ≈4508, `fundedWallet: false`, claim **NOT a Preprod deploy**.
`fund()` is a ledger `Uint` in this skeleton — **no Coin/Zswap** required for local prove.
Exit 3 if proof-server down. On-chain still needs tDUST + wallet providers (see `ESCROW_WITNESS_REQUIREMENTS`).




## CLI output

Every command prints:

1. A banner stating the **honest claim** (not a deploy)
2. Key/value sections (`networkId`, probes, artifact sizes…)
3. The same payload as **JSON** for scripting
4. Brand donate + `@kshot9000` footer

Example:

```
════════════════════════════════════════════════════════════════
  preprod-hello-stub · providers
  wiring + probes — NOT a Preprod deploy
════════════════════════════════════════════════════════════════

▸ Wiring
  networkId          preprod
  …
▸ Live probes
  proof-server       ok · …
  indexer            ok · height …
  node               ok · Midnight Preprod
```

## Exit codes (deploy / wallet gates)

| Code | Meaning |
| --- | --- |
| 0 | OK (advisory warnings may still print) |
| 1 | Unexpected / artifact / runtime failure |
| 2 | Missing or invalid wallet credentials |
| 3 | Proof-server unhealthy (submit refused) |
| 4 | Preprod indexer/node probe failed |
| 5 | Credentials + infra OK; `MIDNIGHT_PREPROD_ALLOW_SUBMIT` not set |
| 6 | Allow set but tDUST still 0 after registration wait |
| 7 | Derived unshielded address != expected funded address |

## Env

```bash
cp .env.preprod.example .env.preprod   # from repo root
# set MIDNIGHT_WALLET_MNEMONIC or MIDNIGHT_WALLET_SEED (one only)
```

See [`docs/PREPROD-FUNDING.md`](../../docs/PREPROD-FUNDING.md).

## Proof-server

Reuse healthy local server:

```bash
curl -sS http://127.0.0.1:6300/health
# or: npm run proof-server:podman
```

## Status (honest)

| Item | State |
| --- | --- |
| Compact hello compiled | **yes** (`contracts/hello-midnight/out`) |
| Providers wiring | **yes** (wallet slots null until funded) |
| Proof-server | local `:6300` — **required** for `prove:hello-local` |
| Local ZK prove | **yes** — `prove:hello-local` (circuit `/prove`, no wallet) |
| Faucet / tDUST | **funded + registered** — see docs/PREPROD-FUNDING.md |
| On-chain deploy | **yes** — see `docs/PREPROD-HELLO-DEPLOY.md` |

## Hello Studio last-prove

`npm run prove:hello-local` writes slim metrics to
`apps/hello-studio/last-prove.json` (+ `/tmp/midnight-hello-last-prove.json`).
Serve Hello Studio (`python3 -m http.server 5187`) and open `#local-prove`,
or use prove-bridge `:6399` (`POST /prove?contract=hello`).

**LOCAL ZK only — NOT on-chain.**

