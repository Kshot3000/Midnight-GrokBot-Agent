# Sealed Invite Studio

Private RSVP / sealed invites for the Midnight dual-state model.

**Educational local stub** — not on-chain, not Compact, not real ADA / DUST transfers from this UI.

## Features

- Invite journey: idle → sealed → RSVPing → proven
- Seal an invite: public title + when; capacity + venue notes + salt in private vault
- Open invite: publishes title + when + domain-separated SHA-256 commitment only
- Private RSVPs: guest names / plus-ones sealed; only commitment hashes + tags on the board
- Capacity theater: prove seats remain without revealing capacity or counts (simulated); reject first-class
- Selective admit + full disclose (warn)
- Keyboard UX: `S` seal · `R` RSVP · `D` donate · `?` shortcuts · `Shift+N` seed
- Starfield / nebula / aurora · skip link · reduced-motion · donate dock (`@kshot9000` + ADA always visible)

## Local run

```bash
cd apps/sealed-invite
python3 -m http.server 5181
# open http://localhost:5181
```

Pages path (when Actions enabled): `/invite/`.

## Honest scope

- No Compact runtime / proof server / Lace connect / settlement
- No claim that GitHub Pages is live until the workflow is enabled
- SHA-256 commitments are a **teaching stand-in** — verify official Compact / Zswap crypto before shipping

## Branding

- Donate ADA: `addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v`
- X: [@kshot9000](https://x.com/kshot9000)
