# Midnight GrokBot Agent

**24/7 Midnight build lab** — scaffolding, Compact starters, Lace connector kit, and a developer landing site for [Midnight](https://midnight.network/), the Cardano partner chain focused on **programmable privacy** with zero-knowledge smart contracts.

Built by [@kshot9000](https://x.com/kshot9000) (creator of [NightDream.io](https://nightdream.io)).

> This repo does **not** invent Midnight APIs. Prefer official docs and examples linked below.

## What’s inside

```
.
├── apps/
│   ├── midnight-lab-site/     # Static marketing / dev landing site
│   └── lace-connect-demo/     # Vite demo: discover + connect Lace Midnight
├── packages/
│   └── lace-midnight-kit/     # Typed DApp connector helpers (official API types)
├── contracts/                 # Compact starter + setup notes
├── BRANDING.md                # Canonical donation address + socials
├── LICENSE                    # MIT
└── README.md
```

| Path | Role |
| --- | --- |
| `apps/midnight-lab-site` | Zero-dependency HTML/CSS/JS site about Midnight + this lab |
| `apps/lace-connect-demo` | Vite page using the kit — **discovery + connect only** (no transfer claims) |
| `packages/lace-midnight-kit` | Enumerate `window.midnight`, connect, addresses/network, graceful errors + Lace workarounds |
| `contracts/hello-midnight` | Commented Compact skeleton (compile after official toolchain install) |
| `BRANDING.md` | Donation address, X handle, NightDream mention |

## Quick start — landing site

No npm required. From the repo root:

```bash
cd apps/midnight-lab-site
python3 -m http.server 5173
# open http://localhost:5173
```

Or open `apps/midnight-lab-site/index.html` directly in a browser.

## Quick start — Lace connect demo

**Requires a browser.** Without Lace installed, the demo still loads and shows “no wallet”. With [Lace](https://www.lace.io/) + Midnight enabled, you can discover providers and connect (default network: **preprod**).

```bash
npm install
npm run dev:lace-demo
# open http://localhost:5174
```

Safety: the demo does **not** call `makeTransfer` / submit. A successful connect is **not** proof that mainnet transfers work.

Kit docs: [`packages/lace-midnight-kit/README.md`](./packages/lace-midnight-kit/README.md) · workarounds: [`packages/lace-midnight-kit/WORKAROUNDS.md`](./packages/lace-midnight-kit/WORKAROUNDS.md)

Pinned types: `@midnight-ntwrk/dapp-connector-api@4.0.1` (common matrix peer: midnight-js **4.1.1** — verify against Midnight’s compatibility matrix).

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
- **NightDream.io:** https://nightdream.io

## License

MIT — see [`LICENSE`](./LICENSE). Official Midnight docs/examples may use their own licenses; when copying from Midnight Foundation materials, follow those upstream terms.

## Recommended next apps

1. Wire `contracts/hello-midnight` through the official Compact compile → TypeScript bindings flow.
2. Extend `apps/lace-connect-demo` with read-only Preprod indexer queries (still no transfer claims until proven).
3. Follow the official privacy-preserving leaderboard tutorial end-to-end, then adapt patterns here.
