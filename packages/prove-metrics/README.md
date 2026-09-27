# `@kshot/prove-metrics`

Shared **local ZK prove metrics** helpers for:

- Hello Studio (`apps/hello-studio`) — `hello.compact` `increment`
- Agent Escrow Studio (`apps/agent-escrow-stub`) — multi-circuit escrow paths

Parses `last-prove.json` (CLI) and prove-bridge `:6399` responses.

**LOCAL prove ≠ on-chain / NOT a Preprod deploy.**

## Why copy, not import?

GitHub Pages and `python3 -m http.server` serve each studio from its own path
(`…/hello/`, `…/escrow/`). A relative import into `packages/` would 404.
Keep this package as the **canonical source**; sync into each app:

```bash
npm run sync:prove-metrics
# or: npm run sync -w @kshot/prove-metrics
```

## API

| Export | Role |
| --- | --- |
| `parseLastProve` / `normalizeProveReport` | Slim + CLI dumps → UI shape |
| `detectProveKind` | `hello` · `escrow` · `escrow-all` |
| `summarizeProveStatus` / `proveStepRows` | Panel status + table rows |
| `formatBytes` / `formatMs` | Honest display (exact B under 16 KiB) |
| `fetchLastProve` / `probeProveBridge` | Soft-fail GET helpers |
| `requestBridgeProve` | Escrow `?path=` or hello `?contract=hello` |
| `requestBridgeProveHello` | Alias for hello |
| `ESCROW_BRIDGE_PATHS` | `initialize` · `happy` · `cancel` · … · `all` |
| `PROVE_CLAIM` | Honesty string |

## Branding

- ADA donate: see root [`BRANDING.md`](../../BRANDING.md)
- X: [@kshot9000](https://x.com/kshot9000)

## Tests

```bash
npm test -w @kshot/prove-metrics
```
