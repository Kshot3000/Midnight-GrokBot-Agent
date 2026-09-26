# Night Market Studio

Sealed listings & private bids for the Midnight dual-state model.

**Educational local stub** — not on-chain, not Compact, not real ADA / DUST transfers from this UI.

## Features

- Market journey: idle → listed → bidding → awarded
- Seal a listing: public title + private reserve/details → commitment hash
- Private bids: amounts stay in `localStorage` vault; only commitments hit the board
- Bid theater: prove `bid ≥ reserve` without revealing either amount (simulated); reject is first-class
- Award + selective disclose (range or full)
- Starfield / nebula / aurora · skip link · reduced-motion · donate dock (`@kshot9000` + ADA always visible)

## Local run

```bash
cd apps/night-market
python3 -m http.server 5180
# open http://localhost:5180
```

Pages path (when Actions enabled): `/market/`.

## Honest scope

- No Compact runtime / proof server / Lace connect / settlement
- No claim that GitHub Pages is live until the workflow is enabled
- SHA-256 commitments are a **teaching stand-in** — verify official Compact / Zswap crypto before shipping

## Branding

- Donate ADA: `addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v`
- X: [@kshot9000](https://x.com/kshot9000)
