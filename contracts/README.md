# contracts/

Placeholder / starter Compact contracts for the Midnight GrokBot lab.

## What lives here

| Path | Purpose |
| --- | --- |
| `hello-midnight/hello.compact` | Well-commented starter skeleton (public counter + notes on private state) |

These files are **educational skeletons**. They follow patterns described in the official Compact docs. Compile and deploy only after installing the official Midnight toolchain.

## Official Compact setup (do this first)

1. Install Compact from the Midnight docs:  
   https://docs.midnight.network/getting-started/installation
2. Pin a compiler version from the compatibility matrix (example from docs: `compact update 0.31.1`).
3. Run a local proof server (Docker), e.g. the image/tag shown in the install guide.
4. Use [Lace](https://www.lace.io/) with Midnight settings pointed at your local proof server when developing against Preprod.
5. Fund with faucet **tNIGHT**, then register / generate **tDUST** for fees — see:  
   https://docs.midnight.network/guides/acquire-tokens

## Compile (after Compact is installed)

```bash
# From repo root — adjust pragma/version to match your installed Compact + matrix
compact compile contracts/hello-midnight/hello.compact contracts/hello-midnight/out/
```

Exact CLI flags and output layout can change between Compact releases — always prefer the current docs:

- Compact overview: https://docs.midnight.network/compact
- Compact language reference: https://docs.midnight.network/compact/reference/compact-reference
- Leaderboard tutorial (full DApp): https://docs.midnight.network/tutorials/leaderboard/overview

## Tokens (high-level, accurate)

- **NIGHT** — Midnight’s native unshielded utility / governance token; registered holdings generate DUST.
- **DUST** — Shielded, non-transferable network resource used to pay transaction fees (testnet: **tNIGHT** / **tDUST**).

Do not invent APIs or RPCs here. Use official Midnight.js, indexer, and DApp connector docs when wiring TypeScript clients.
