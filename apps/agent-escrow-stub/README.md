# Agent Escrow Stub

Local **role theater** + **dual-state proof** UX for the Midnight Agent Escrow Compact skeleton.

Built by [@kshot9000](https://x.com/kshot9000) / [Kshot3000](https://github.com/Kshot3000)
(Midnight GrokBot Agent).

## Features

- Act as Client / Agent / Approver — actions outside your role stay disabled
- Dual-state proofs: public commitment hash vs private agent work notes
- Visual timeline + milestone track + audit log
- Branding + Cardano donate always visible

## Honesty

- Browser-local stub only — **not** on-chain
- No Lace / proof server / Compact compile claim

## Run

```bash
cd apps/agent-escrow-stub
python3 -m http.server 5175
# open http://localhost:5175
```

Compact skeleton: [`contracts/agent-escrow`](../../contracts/agent-escrow/)

## Branding

- X: [@kshot9000](https://x.com/kshot9000)
- ADA: `addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v`
