# Agent Escrow UI stub

Minimal **browser stub** for the Agent Escrow Compact skeleton. It walks the
reference state machine in local JavaScript only — **no Lace connect, no proof
server, no on-chain deploy**.

- Compact contract: [`contracts/agent-escrow/`](../../contracts/agent-escrow/)
- Full JS/Python protocol reference:  
  https://github.com/Kshot3000/Cardano-Midnight-Qwen-Builder/tree/main/apps/agent-escrow

## Run

```bash
cd apps/agent-escrow-stub
python3 -m http.server 5175
# open http://localhost:5175
```

Or open `index.html` directly in a browser.

## What this is / isn’t

| Is | Isn’t |
| --- | --- |
| Local demo of roles + transitions | A Compact / Midnight.js DApp |
| Teaching separation of duties | Wallet-connected approve/release |
| Link hub to the Compact skeleton | Proof of on-chain escrow |

Next real step: compile `contracts/agent-escrow` with Compact **~0.31.1**, then
wire witnesses via Midnight.js following `create-mn-app` / `example-bboard`.

## Branding

[@kshot9000](https://x.com/kshot9000) · see [`BRANDING.md`](../../BRANDING.md)
