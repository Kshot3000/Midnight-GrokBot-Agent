# Proving topology: local, wallet-delegated, and hosted

Upstream: [midnightntwrk/midnight-docs#1383](https://github.com/midnightntwrk/midnight-docs/issues/1383)

Official docs only (do not invent APIs):

- https://docs.midnight.network/guides/local-proving
- https://docs.midnight.network/guides/run-proof-server
- https://docs.midnight.network/guides/security-best-practices
- https://docs.midnight.network/concepts/how-midnight-works/end-to-end-architecture
- https://docs.midnight.network/api-reference/dapp-connector (getProvingProvider, proverServerUri)
- https://docs.midnight.network/relnotes/dapp-connector-api/dapp-connector-api-4-0-0
- https://docs.midnight.network/sdks/community/wallets/community-wallets-integration

Issue #1383 asks for a guide that states the supported topologies (local proof server, wallet-delegated proving, hosted), says what each exposes, covers the getProvingProvider gap, and gives practical guidance. Official pages already cover the pieces; this lab note collects them for builders on the pinned stack.

## Official topologies

| Topology | How it is reached | What the proof server sees | Official guidance |
| --- | --- | --- | --- |
| Local proof server | DApp or Lace points at `http://localhost:6300` (or a machine you control). Use `httpClientProofProvider` + `NodeZkConfigProvider` / `FetchZkConfigProvider`. | Witness data and circuit artifacts. It does not hold wallet keys. | Preferred. Run your own. See local-proving and run-proof-server. |
| Wallet-delegated | `connectedAPI.getProvingProvider(keyMaterialProvider)` (DApp Connector 4.0+). Lace 2.1.0+ exposes it; earlier builds do not. Feature-detect. | Same proof request (witnesses included). The provider the wallet returns sends requests to the proof server configured in the wallet. | Preferred when the wallet implements it. Falls back to local when the method is missing. proverServerUri is deprecated (removal planned in 5.0.0). |
| Hosted / third-party | A remote proof server you do not control. | Full proof request, including witnesses. | Not recommended for privacy-sensitive data. Official security page: access only a local proof server or one on a machine you control over an encrypted channel. |

`disclose()` and ledger writes are separate from proving; proving happens after circuit execution and before balancing/submit. See end-to-end architecture and security-best-practices for the trust boundary.

## Common preprod path notes

- Proof server unreachable on port 6300 is a frequent reported error. Confirm the container is running and the URI matches what Lace or the DApp uses.
- Feature-detect `typeof api.getProvingProvider === "function"` before calling. Catch rejections.
- Pin: proof-server 8.1.0 (lab), midnight-js 4.1.1, DApp Connector 4.0.1.

This lab does not claim a fix of the public docs, proof server, indexer, or node. Source only. LOCAL-TRUE.

Lab helper: `packages/preprod-hello-stub/src/proving-topology-decode.mjs` classifies reported error strings against the official patterns. It does not call any network or proof server.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
