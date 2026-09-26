# Proof Playground

Visual ZK / circuit explainer for Midnight — **LOCAL-TRUE**.

Pick a circuit · set private witnesses · watch the graph light · simulated prove / verify theater.

Real `localStorage` (schema v2) for **session history + witness presets**, BroadcastChannel multi-tab sync, JSON export/import.
Honest labels: **LOCAL-TRUE ≠ on-chain / ≠ proof server**. Not Compact runtime.

## Run locally

```bash
cd apps/proof-playground
python3 -m http.server 5182
# open http://localhost:5182
npm test
```

Pages path (when Actions enabled): `/proof/`.

## Honest scope

- Does **not** run a real proof server, Compact, Lace, or ADA / DUST.
- Prove / verify / tamper paths are **teaching stand-ins**.
- Export may include history blobs / witness presets — treat as sensitive.

## Branding

- X: [@kshot9000](https://x.com/kshot9000)
- ADA: `addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v`
