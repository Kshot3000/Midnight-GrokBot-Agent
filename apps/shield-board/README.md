# Shield Board

Flagship **dual-state** Midnight privacy bulletin studio — local educational stub.

Built by [@kshot9000](https://x.com/kshot9000) · [Kshot3000](https://github.com/Kshot3000) ·
[Midnight-GrokBot-Agent](https://github.com/Kshot3000/Midnight-GrokBot-Agent).

## What you get

- **Public ledger pane** — commitments, owner pk, sequence, disclosure flag
- **Private vault pane** — message bodies that stay in this browser until you disclose
- **Witness-derived identity** — `derive(sk)` binding (MPS-0029). Take-down fails for Mallory
- Nebula / starfield UI, compose → seal animation, wallet enumeration (`window.midnight`, never hardcode `mnLace`)
- Clear branding + Cardano donate address

Inspired by [`example-bboard`](https://github.com/midnightntwrk/example-bboard).

## Honesty

- Browser-local simulation only
- **No** Compact compile / proof server / on-chain deploy claim
- **No** Lace `connect` / `makeTransfer` in this app (scan-only)

## Run

```bash
cd apps/shield-board
python3 -m http.server 5177
# open http://localhost:5177
```

## Branding

- X: [@kshot9000](https://x.com/kshot9000)
- ADA: `addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v`

## Pages

When GitHub Actions Pages is enabled: `/board/`

