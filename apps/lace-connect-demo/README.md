# Lace Midnight connect demo

Minimal **Vite + TypeScript** page that uses [`packages/lace-midnight-kit`](../../packages/lace-midnight-kit) to:

1. **Connect status matrix** — live probe of `window.midnight` (enumeration vs legacy `mnLace`, `^4.0.0` compat, duplicate `rdns`)
2. Enumerate `window.midnight` providers (UUID / rdns)
3. Connect with a chosen `networkId` (default **preprod**)
4. Show connection status + addresses when Lace permits

## Safety label

**Discovery + connect only.** This demo does **not** call `makeTransfer`, balance, or submit.
A green “connected” state is **not** proof that mainnet (or testnet) transfers work.

## Prerequisites

- Node 18+
- **For connect:** [Lace](https://www.lace.io/) browser extension with Midnight enabled (Chrome/Brave/etc.)
- Without Lace: the page still loads and shows an empty provider list

## Run

```bash
# from repo root
cd packages/lace-midnight-kit && npm install && npm run build && cd ../..
cd apps/lace-connect-demo && npm install && npm run dev
# open http://localhost:5174
```

Vite aliases the kit to `packages/lace-midnight-kit/src` for local iteration.

## Branding

- ADA: `addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v`
- X: [@kshot9000](https://x.com/kshot9000)

## Official links

- https://docs.midnight.network/guides/react-wallet-connect
- https://github.com/midnightntwrk/midnight-dapp-connector-api
