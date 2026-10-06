# Browser DApp lifecycle (lab)

Upstream: [midnightntwrk/midnight-docs#1379](https://github.com/midnightntwrk/midnight-docs/issues/1379) asks for a browser guide that covers connect, providers, deploy, call, and reading private state. That page is not in the published docs yet. This lab note only restates methods that already exist on the official pages below. It does not add a connector method, and it does not claim a public deploy, indexer fix, or node fix.

Official sources:

- https://docs.midnight.network/api-reference/dapp-connector
- https://docs.midnight.network/sdks/community/wallets/community-wallets-integration
- https://docs.midnight.network/guides/deploy-and-operate
- https://docs.midnight.network/guides/configure-providers

Pins for this lab: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Documented order a browser DApp can follow:

1. Read `window.midnight` initial APIs. Each entry exposes `name`, `icon`, `apiVersion`, and `connect(networkId)`. The published connect sample filters `apiVersion` with `^1.0`. This lab pins connector 4.0.1, so a checker should not treat a `1.x` filter as the only compatible set.
2. `connect(networkId)` with `preprod`, `preview`, `mainnet`, or `undeployed`. Then `getConnectionStatus()` and check `networkId` matches the one you requested.
3. `getConfiguration()` returns `indexerUri`, `indexerWsUri`, `proverServerUri`, `substrateNodeUri`, and `networkId`. Follow those URIs. The community wallet page says `Configuration.proverServerUri` is deprecated: feature-detect `getProvingProvider`. Lace does not expose it; fall back to a local proof server at `http://localhost:6300` (image `midnightntwrk/proof-server:8.1.0`). Do not send witnesses to the indexer.
4. Call `setNetworkId` from `@midnight-ntwrk/midnight-js-network-id` before building providers. Midnight.js reads it when it normalizes addresses.
5. Assemble the six required `MidnightProviders` slots from the deploy guide: `privateStateProvider`, `publicDataProvider`, `zkConfigProvider`, `proofProvider`, `walletProvider`, `midnightProvider`. `loggerProvider` is optional. In the browser, `levelPrivateStateProvider` resolves to IndexedDB; leave `cryptoBackend` unset so Web Crypto can fall back. Do not read that store from a server component.
6. Deploy or call only after those slots exist. Submission is `ConnectedAPI.submitTransaction` or `midnightProvider.submitTx`. Private state stays on the device; the indexer is the public read path.

Lab checker (no network, no wallet): `packages/preprod-hello-stub/src/browser-lifecycle.mjs`.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
