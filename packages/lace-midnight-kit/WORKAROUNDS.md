# Lace Midnight connector workarounds

Canonical structured list lives in `src/workarounds.ts` (`LACE_MIDNIGHT_WORKAROUNDS`).

## Enumerate `window.midnight` (not `mnLace`)

Wallets inject `InitialAPI` under a **fresh UUID** key. Hardcoding `window.midnight.mnLace` often yields `undefined` even when Lace is installed.

**Do:** `Object.values(window.midnight ?? {})` / `discoverProviders()` from this kit.

Refs: https://docs.midnight.network/guides/react-wallet-connect

## Wallet unavailable after `connect()`

Symptom: `connect('preprod')` succeeds, then address/balance/config methods throw `Wallet is unavailable` while `getConnectionStatus()` may still work.

Mitigation: update Lace (2.3+), wait until fully synced, restart extension/browser, reset Midnight account sync in Lace settings. Kit maps this to `KitErrorCodes.WalletUnavailable`.

Ref: https://github.com/input-output-hk/lace/issues/2243

## DUST freeze while Synced

UI may show Synced while spendable DUST / fee payment still fails. Confirm network, faucet/generation flow, and Lace fee-from-spendable-DUST behaviour. Reset sync if Dust events failed.

## `makeTransfer` when options omitted

`makeTransfer(outputs, options?)` — `payFees` defaults to **true**. Pass `{ payFees: true | false }` explicitly when fee ownership matters.

**This lab demo does not call `makeTransfer` and does not claim mainnet transfers work.**

## Version matrix

Pin `@midnight-ntwrk/dapp-connector-api@4.0.1` (this package). Common peer: midnight-js **4.1.1**. Re-check Midnight’s official compatibility matrix before deploy.
