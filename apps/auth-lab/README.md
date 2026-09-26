# Auth Forge Studio (MPS-0029)

Flagship educational lab that teaches why `ownPublicKey()` alone is forgeable for Compact authorization, and why witness-derived keys (`publicKey(localSecretKey)` / `persistentHash` patterns) are the safe default — the same pattern used by [`example-bboard`](https://github.com/midnightntwrk/example-bboard).

Built by [@kshot9000](https://x.com/kshot9000).

## What this is

- Flagship static HTML/CSS/JS (no npm) — starfield, aurora/nebula, sticky topbar, donate dock
- **Attack journey** stepper (idle → deployed → forged → witness-bound)
- Dual-rail threat meters + interactive **auth scorecard**
- Forge theater: unsafe `ownPublicKey` bypass vs secret-bound reject
- Local bulletin-board stub bound to a browser-generated secret (not on-chain)
- Live `window.midnight` enumeration + optional injection watch (never hardcodes `mnLace`)
- a11y: skip link, live region, reduced-motion, focus rings, mobile nav
- Links to [MPS-0029](https://github.com/midnightntwrk/midnight-improvement-proposals/blob/main/mps/mps-0029-compact-caller-identity.md)
- Donate ADA + **@kshot9000** always visible

## What this is not

- Not a deployed Compact contract / proof server
- Not a proof that Lace transfers work
- Does not claim GitHub Pages is live until Actions are enabled
- SHA-256 “derive” is a teaching stand-in — verify official Compact crypto before shipping

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
