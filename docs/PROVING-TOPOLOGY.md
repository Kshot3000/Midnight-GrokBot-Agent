# Proving topology: local, wallet-delegated, hosted

Upstream: [midnightntwrk/midnight-docs#1383](https://github.com/midnightntwrk/midnight-docs/issues/1383)

Official wallet integration (DApp Connector API 4.0.1) names three places a ZK proof can be built. This lab does not add a connector method and does not claim the public Preprod indexer or node was fixed.

- Local proof server. Lace has no `getProvingProvider()`. Settings, Midnight, Local points at `http://localhost:6300`. Start with the documented image pin: `docker run -p 6300:6300 midnightntwrk/proof-server:8.1.0 midnight-proof-server -v` (https://docs.midnight.network/getting-started/installation). The lab hello prove path already uses `httpClientProvingProvider` against that URL.
- Wallet-delegated. `ConnectedAPI.getProvingProvider(keyMaterialProvider)` is the v4 method. Feature-detect with `typeof api.getProvingProvider === "function"` before calling it. 1AM implements it; Lace does not. Do not hard-code the deprecated `Configuration.proverServerUri`.
- Hosted. The proof-server guide allows a remote machine you control, over an encrypted channel, because the payload includes witness data. An indexer GraphQL URL is not a proof server. This repo does not ship a public prover endpoint.

`packages/preprod-hello-stub/src/prove-path.mjs` only classifies that choice. It does not prove, submit, or talk to Preprod. Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Also open on this sweep, not fixed here: servicedesk [#230](https://github.com/midnightntwrk/servicedesk/issues/230) (indexer tip lag), [#225](https://github.com/midnightntwrk/servicedesk/issues/225) (RPC 1010 wrapped as a generic submit error), [#216](https://github.com/midnightntwrk/servicedesk/issues/216) (skipped ledger event ids). example-hello-world [#41](https://github.com/midnightntwrk/example-hello-world/issues/41) is an unused-dependency chore, not a prove-path bug.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
