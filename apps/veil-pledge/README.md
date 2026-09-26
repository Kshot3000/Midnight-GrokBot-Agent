# Veil Pledge Studio

Private tip jar & pledge board for the Midnight dual-state model.

**Educational local stub** — not on-chain, not Compact, not real ADA transfers from this UI.

## Features

- Pledge journey: idle → sealed → committed → disclosed
- Compose & seal: amount + note + salt stay in a private vault (`localStorage`)
- Public commitment: domain-separated SHA-256 teaching stand-in
- Threshold theater: prove `amount ≥ X` without revealing the exact tip (simulated)
- Tip jar atelier with always-visible Cardano donate address + `@kshot9000`
- Starfield / nebula / aurora · skip link · reduced-motion · donate dock

## Local run

```bash
cd apps/veil-pledge
python3 -m http.server 5179
# open http://localhost:5179
```

Pages path (when Actions enabled): `/pledge/`.

## Honest scope

- No Compact runtime / proof server / Lace connect / `makeTransfer`
- No claim that GitHub Pages is live until the workflow is enabled
- SHA-256 commitments are a **teaching stand-in** — verify official Compact / Zswap crypto before shipping

## Branding

- Donate ADA: `addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v`
- X: [@kshot9000](https://x.com/kshot9000)
