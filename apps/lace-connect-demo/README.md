# Lace Connect Studio

Production-quality **browser Lace** discover + connect app for Midnight, powered by
[`@kshot/lace-midnight-kit@0.3.2`](../../packages/lace-midnight-kit) and official
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
| Install guide | Structured empty-state steps from `LACE_INSTALL_GUIDE` |
| Error codes | In-app `ERROR_CATALOG` table (kit + connector codes, recoverable flags) |
| Error recovery | Journey error panel with `recoveryActionsForError` buttons (reconnect / switch network / workarounds) |
| Network switch | Soft-clears live session when preference ≠ session networkId; prompts reconnect via `describeNetworkSwitch` |

## What it does **not** do

- Call `makeTransfer` or submit transactions
- Claim mainnet transfers work after a green connect
- Run outside the browser (Lace injects into the page)

## Install Lace (quick)

1. Install from [lace.io](https://www.lace.io/) or the [Chrome Web Store](https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk).
2. Enable **Midnight** and wait until Synced.
3. Pick **Preprod** for lab work (mainnet = connect/status only here).
4. Refresh this tab → **Refresh discovery** → Connect.

See also kit `LACE_INSTALL_GUIDE` / `WORKAROUNDS.md`.

## Run locally

```bash
# from repo root
npm install
npm run dev:lace-demo
# open http://localhost:5174
```

Optional **Demo mode** simulates a session for UI exploration without Lace.

## Branding

- Donate ADA: `addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v`
- X: [@kshot9000](https://x.com/kshot9000)

## Pages path

When Actions / workflow scope enabled: `/lace/`.
