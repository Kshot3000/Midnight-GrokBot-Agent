# contracts/

Placeholder / starter Compact contracts for the Midnight GrokBot lab.

## What lives here

| Path | Purpose |
| --- | --- |
| `hello-midnight/hello.compact` | Starter: public Counter `increment` plus witness/`disclose` `recordNote` and matching `clearNote` (clear is source-only until recompile, LOCAL-TRUE) |
| `agent-escrow/` | **Agent Escrow** Compact skeleton (milestone escrow, MPS-0029 auth) + compile notes pinned to Compact **~0.31.1** |
| `AUDIT-NOTES.md` | Audit-shift findings (archived Counter listing, MPS-0029 reinforcement, Lace `window.midnight`) |

These files are **educational skeletons**. They follow patterns described in the official Compact docs and `example-bboard` / `create-mn-app`. Compile and deploy only after installing the official Midnight toolchain. **No on-chain deploy is claimed by this repo unless a commit explicitly records one.**

## Official Compact setup (do this first)

1. Install Compact from the Midnight docs:  
   https://docs.midnight.network/getting-started/installation
2. Pin a compiler version from the compatibility matrix (lab target for escrow: **`compact` ~0.31.1**, matching `create-mn-app` remote examples).
3. Run a local proof server (Docker), e.g. the image/tag shown in the install guide.
4. Use [Lace](https://www.lace.io/) with Midnight settings pointed at your local proof server when developing against Preprod.
5. Fund with faucet **tNIGHT**, then register / generate **tDUST** for fees — see:  
   https://docs.midnight.network/guides/acquire-tokens

## Compile (verified on this lab — 2026-09-26 CT)

Lab box successfully installed **Compact CLI 0.5.2** + toolchain **0.31.1** (language **0.23.0**, ledger **8.0.2**, runtime **0.16.0**) and compiled both skeletons with proving keys.

```bash
# 1) Install Compact CLI (needs xz-utils on Debian/Ubuntu)
#    https://docs.midnight.network/getting-started/installation
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
export PATH="$HOME/.local/bin:$PATH"
compact --version   # expect compact 0.5.x

# 2) Install / pin toolchain 0.31.1
compact update 0.31.1
# If GitHub API rate-limits `compact update`, download the musl zip directly and unpack to:
#   ~/.compact/versions/0.31.1/x86_64-unknown-linux-musl/
# Asset: compactc_v0.31.1_x86_64-unknown-linux-musl.zip from midnightntwrk/compact releases

# 3) Compile (pin +0.31.1 explicitly)
compact compile +0.31.1 --version            # → 0.31.1
compact compile +0.31.1 --language-version   # → 0.23.0

# Hello starter (full ZK keys)
npm run compact:hello
# → contracts/hello-midnight/out/{contract,compiler,zkir,keys}/

# Agent Escrow (full ZK keys; 12 circuits)
npm run compact:escrow
# → contracts/agent-escrow/src/managed/agent-escrow/{contract,compiler,zkir,keys}/

# Faster iteration (skip proving keys):
npm run compact:hello:skip-zk
npm run compact:escrow:skip-zk
```

Artifacts under `**/managed/` and `contracts/hello-midnight/out*` are **gitignored**. Re-run compile locally. **No on-chain deploy** is claimed.

`recordNote` (witness `localNote`, ledger `lastNoteHash` / `noteCount`) is in source. `clearNote` proves the same local note and resets `lastNoteHash` so `recordNote` can run again (official writing-a-contract set/clear). `clearNote` is source-only until the next `npm run compact:hello`. After that compile, expect `keys/clearNote.prover` as well. Existing `increment` / `recordNote` keys stay valid until that compile. LOCAL-TRUE.

Lab box now has **Podman 5.4.2** + proof-server **8.1.0** on `:6300`, and **Node 22.23.3 via fnm** (system node may stay v20). Local circuit prove works (`npm run prove:hello-local`). Still blocked for *on-chain* Preprod: funded wallet + captcha faucet / tDUST.

Consumer packaging: [`ARTIFACT-CONSUMERS.md`](./ARTIFACT-CONSUMERS.md) · inventory: `npm run artifacts:list`.

Exact CLI flags and output layout can change between Compact releases — always prefer the current docs:

- Compact overview: https://docs.midnight.network/compact
- Compact language reference: https://docs.midnight.network/compact/reference/compact-reference
- Writing a contract (set/clear): https://docs.midnight.network/compact/reference/writing
- Explicit disclosure: https://docs.midnight.network/compact/explicit_disclosure
- Bulletin board example: https://docs.midnight.network/examples/dapps/bboard
- Leaderboard tutorial (full DApp): https://docs.midnight.network/tutorials/leaderboard/overview
- create-mn-app: https://github.com/midnightntwrk/create-mn-app
- example-bboard: https://github.com/midnightntwrk/example-bboard

## Auth note (MPS-0029)

Do **not** authorize privileged circuits with `ownPublicKey()` alone. Prefer witness-derived
commitments (`localSecretKey` + `persistentHash` + domain separator), as in bboard /
leaderboard and `contracts/agent-escrow`.

## Tokens (high-level, accurate)

- **NIGHT** — Midnight’s native unshielded utility / governance token; registered holdings generate DUST.
- **DUST** — Shielded, non-transferable network resource used to pay transaction fees (testnet: **tNIGHT** / **tDUST**).

Do not invent APIs or RPCs here. Use official Midnight.js, indexer, and DApp connector docs when wiring TypeScript clients.

## Shielded index without value (servicedesk #213)

`contracts/hello-midnight/coin-index-gap.compact` records a `persistentCommit` receipt and does not call `writeCoin`. Official `writeCoin` fills a `QualifiedShieldedCoinInfo` cell, which includes `value`. See `docs/SHIELDED-INDEX-WITHOUT-VALUE.md`. Not a deploy and not an indexer fix.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation

