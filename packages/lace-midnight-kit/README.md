# `@kshot/lace-midnight-kit`

Reusable **browser** helpers for connecting a DApp to **Lace Midnight** via the official
[`@midnight-ntwrk/dapp-connector-api`](https://www.npmjs.com/package/@midnight-ntwrk/dapp-connector-api) **4.0.1** types.

Built for the [Midnight GrokBot Agent](https://github.com/Kshot3000/Midnight-GrokBot-Agent) lab by [@kshot9000](https://x.com/kshot9000).

## What this kit does

| Capability | Status |
| --- | --- |
| Enumerate `window.midnight` (UUID / rdns) | ✅ |
| Filter by `apiVersion` (semver caret) | ✅ |
| `connect(networkId)` + connection status | ✅ |
| Read unshielded / shielded / dust addresses | ✅ (when Lace allows) |
| Graceful `LaceMidnightKitError` + user hints | ✅ |
| Documented Lace workarounds | ✅ see below / `src/workarounds.ts` |
| Mainnet / Preprod **transfers** (`makeTransfer`) | ❌ **not claimed** — not in demo |

## What it does **not** do

- Invent Midnight APIs
- Hardcode `window.midnight.mnLace` (docs drift → `undefined`)
- Promise that mainnet transfers work after a connect-only demo
- Run outside the browser (Lace injects into the page)

## Install

From the monorepo (or publish later):

```bash
cd packages/lace-midnight-kit
npm install
npm run build
```

Dependency (honest pin matching the common matrix entry):

- `@midnight-ntwrk/dapp-connector-api@4.0.1`
- Peer ecosystem note: **midnight-js 4.1.1** is often listed alongside connector 4.0.1 — verify against Midnight’s **compatibility matrix** before production.

## Quick usage

```ts
import {
  discoverProviders,
  connectMidnightWallet,
  connectWithProvider,
  MidnightNetworkIds,
  normalizeConnectorError,
  userHintForError,
} from '@kshot/lace-midnight-kit';

// 1) Discover — NEVER window.midnight.mnLace
const { compatible, hasDuplicateRdns } = discoverProviders({
  apiVersionRange: '^4.0.0',
});

if (compatible.length === 0) {
  // Show: install Lace + Midnight, refresh
}

// 2) Let the user pick when length > 1, then:
const session = await connectWithProvider(compatible[0], {
  networkId: MidnightNetworkIds.Preprod, // test network
});

console.log(session.networkId, session.addresses.unshieldedAddress);
```

## Official docs

- React wallet connect guide: https://docs.midnight.network/guides/react-wallet-connect
- DApp connector API: https://docs.midnight.network/api-reference/dapp-connector
- Spec / types source: https://github.com/midnightntwrk/midnight-dapp-connector-api

## Lace workarounds (summary)

1. **Enumerate** `window.midnight` — UUID keys, not `mnLace`.
2. **Wallet unavailable after connect** — often Preprod sync / OOM; update Lace, wait for full sync, restart extension, reset sync in account settings ([lace#2243](https://github.com/input-output-hk/lace/issues/2243)).
3. **DUST freeze while “Synced”** — treat UI sync as insufficient proof for fee payment; confirm network + spendable DUST.
4. **`makeTransfer` options** — `payFees` defaults to `true` when options omitted; pass explicitly when needed. This kit’s demo does **not** call it.

Export `LACE_MIDNIGHT_WORKAROUNDS` / `formatWorkaroundsMarkdown()` for in-app help panels.

## Branding

- ADA donations: `addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v`
- X: [@kshot9000](https://x.com/kshot9000)

## License

MIT (this package). Official `@midnight-ntwrk/dapp-connector-api` is Apache-2.0 — follow upstream terms for that dependency.
