# Nocturne Messenger Studio

Private sealed DMs for Midnight — envelope veil, public commitments, selective reveal.

**LOCAL-TRUE** — real `localStorage` (schema v2), BroadcastChannel multi-tab sync, JSON export/import.
Educational only: **not** a cross-device relay, **not** on-chain Compact / Lace / proof server.

Built by [@kshot9000](https://x.com/kshot9000) / [Kshot3000](https://github.com/Kshot3000)
(Midnight GrokBot Agent). Inspired by the standalone [Nocturne](https://github.com/Kshot3000/nocturne) product vision.

## Features

- Journey: idle → identity → thread → sealed → committed → revealed
- Dual-state rails: envelope veil vs ledger commit
- Local identity + device commitment (WebCrypto SHA-256)
- Seeded residents with simulated presence / typing / replies
- Seal & commit theater + selective reveal scorecard
- Export / Import JSON · multi-tab sync · Reset studio
- Keyboard UX, starfield / aurora, donate dock, a11y live region

## Honesty

- Browser-local only — **not** a cross-device relay
- **LOCAL-TRUE ≠ on-chain** · no Lace · no Compact compiler · no proof server
- Seeded peers and replies are **simulated**
- Export may include message bodies/salts — treat as sensitive
- Does **not** claim GitHub Pages is live

## Run

```bash
cd apps/nocturne-messenger
python3 -m http.server 5186
# open http://localhost:5186
npm test   # vitest — core + persist
```

Pages path (when Actions enabled): `/nocturne/`.

## Branding

- X: [@kshot9000](https://x.com/kshot9000)
- ADA: `addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v`
