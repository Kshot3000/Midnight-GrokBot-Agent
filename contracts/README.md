# contracts/

Placeholder / starter Compact contracts for the Midnight GrokBot lab.

## What lives here

| Path | Purpose |
| --- | --- |
| `hello-midnight/hello.compact` | Well-commented starter skeleton (public counter + notes on private state) |
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

## Compile (after Compact is installed)

```bash
# Hello starter
compact compile contracts/hello-midnight/hello.compact contracts/hello-midnight/out/

# Agent Escrow (preferred: npm script in that package)
cd contracts/agent-escrow && npm run compact
# → compact compile src/agent-escrow.compact ./src/managed/agent-escrow
```

Exact CLI flags and output layout can change between Compact releases — always prefer the current docs:

- Compact overview: https://docs.midnight.network/compact
- Compact language reference: https://docs.midnight.network/compact/reference/compact-reference
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
