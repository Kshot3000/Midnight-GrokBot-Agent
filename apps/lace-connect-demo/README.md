# Lace Connect Studio

Production-quality **browser Lace** discover + connect app for Midnight, powered by
[`@kshot/lace-midnight-kit@0.3.0`](../../packages/lace-midnight-kit) and official
`@midnight-ntwrk/dapp-connector-api@4.0.1`.

## What works (real function)

| Flow | Behavior |
| --- | --- |
| Discover | Enumerates `window.midnight` (UUID keys — never hardcode `mnLace`) |
| Connect | Calls Lace `connect(networkId)` on the selected provider |
| Prefs | Persists network + preferred wallet + last session snapshot in `localStorage` |
| Reconnect | One-click real `connect()` from saved prefs |
| Refresh | Re-reads status, addresses, and balances |
| Health | Polls `getConnectionStatus`; clears session if Lace disconnects |
| Capability radar | Read-only probe including balances; `makeTransfer` / submit skipped |

## What it does **not** do

- Call `makeTransfer` or submit transactions
- Claim mainnet transfers work after a green connect
- Run outside the browser (Lace injects into the page)

## Run locally

```bash
# from repo root
npm install
npm run dev:lace-demo
# open http://localhost:5174
```

Install [Lace](https://www.lace.io/) with Midnight enabled for a live session.
Optional **Demo mode** simulates a session for UI exploration without Lace.

## Branding

- Donate ADA: `addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v`
- X: [@kshot9000](https://x.com/kshot9000)

## Pages path

When Actions / workflow scope enabled: `/lace/`.
