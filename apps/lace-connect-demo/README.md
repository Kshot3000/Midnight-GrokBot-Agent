# Lace Midnight Connect Studio

Flagship **Vite + TypeScript** page that uses [`packages/lace-midnight-kit`](../../packages/lace-midnight-kit) **0.2.0** to:

1. **Connect journey** — labeled phases (idle → discover → ready → approve → status → addresses → connected)
2. **Injection watch** — poll `window.midnight` for late Lace inject
3. **Connect status matrix** — enumeration vs legacy `mnLace`, `^4.0.0` compat, duplicate `rdns`
4. **Discover + connect** — UUID / rdns providers, network pills (default **preprod**)
5. **Capability radar** — read-only post-connect probe (`makeTransfer` listed as skipped)
6. **Demo mode** — simulated session for UX review without Lace (honestly labeled)

## Safety label

**Discovery + connect only.** This studio does **not** call `makeTransfer`, balance, or submit.
A green “connected” state is **not** proof that mainnet (or testnet) transfers work.
Demo mode is **SIMULATED** — never claim it is a real Lace wallet.

## Prerequisites

- Node 18+
- **For live connect:** [Lace](https://www.lace.io/) browser extension with Midnight enabled
- Without Lace: page loads, matrix warns, Demo mode explores the UI

## Run

```bash
# from repo root
npm install
npm run dev:lace-demo
# open http://localhost:5174
```

Vite aliases the kit to `packages/lace-midnight-kit/src` for local iteration.

## Branding

- ADA: `addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v`
- X: [@kshot9000](https://x.com/kshot9000)

## Official links

- https://docs.midnight.network/guides/react-wallet-connect
- https://github.com/midnightntwrk/midnight-dapp-connector-api
- https://www.lace.io/
