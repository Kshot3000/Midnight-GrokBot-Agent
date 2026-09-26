# MPS-0029 Auth Lab

Interactive **local** demo that teaches why `ownPublicKey()` alone is forgeable for Compact authorization, and why witness-derived keys (`publicKey(localSecretKey)` / `persistentHash` patterns) are the safe default — the same pattern used by [`example-bboard`](https://github.com/midnightntwrk/example-bboard).

## What this is

- Polished static HTML/CSS/JS (no npm)
- Side-by-side **unsafe vs safe** Compact snippets
- Local bulletin-board stub bound to a browser-generated secret (not on-chain)
- Live `window.midnight` enumeration panel (never hardcodes `mnLace`)
- Links to [MPS-0029](https://github.com/midnightntwrk/midnight-improvement-proposals/blob/main/mps/mps-0029-compact-caller-identity.md)

## What this is not

- Not a deployed Compact contract
- Not a proof that Lace transfers work
- Does not call `ownPublicKey()` for auth in the stub — the unsafe path is simulated to show the forge

## Run locally

```bash
cd apps/auth-lab
python3 -m http.server 5176
# open http://localhost:5176
```

On GitHub Pages (once workflow is live): `/auth/`

## Branding

Built by [@kshot9000](https://x.com/kshot9000) · donate ADA  
`addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v`
