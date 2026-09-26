# Proof Playground

Visual ZK / circuit explainer for Midnight — educational **local stub**.

Witnesses → gates → public outputs → simulated prove / verify theater.
Starfield + aurora, keyboard shortcuts, donate dock (`@kshot9000` + Cardano addr), honest **LOCAL STUB · not on-chain** labels.

## Run locally

```bash
cd apps/proof-playground
python3 -m http.server 5182
# open http://localhost:5182
```

Documented Pages path (when Actions enabled): `/proof/`.

## Honest scope

- Does **not** run Compact, a proof server, Lace, or real ADA / DUST.
- Does **not** claim GitHub Pages is live until workflow scope + Actions are set.
- Circuit diagrams and SHA-256 blobs are **teaching stand-ins** — verify official Compact / Zswap crypto before shipping.

## Circuits

| Id | Teaching point |
|----|----------------|
| `commit` | H(value‖salt) → public commit |
| `range` | Prove amount ≥ T without revealing amount |
| `equality` | Two commits, same opening |
| `disclose` | Dual-state sealed / range / full |
| `sum` | Prove a+b ≥ T without revealing a or b |

Built by [@kshot9000](https://x.com/kshot9000).
