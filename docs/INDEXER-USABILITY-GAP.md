# Indexer usability guide is still missing

Upstream: [midnightntwrk/midnight-docs#285](https://github.com/midnightntwrk/midnight-docs/issues/285)

Issue #285 asks for a guide that sits next to the full-node page and walks an operator from a Midnight node to a usable indexer. That page is still not in the docs. What exists today is the API reference and two local-network recipes, which do not agree on the image pin.

Official pages, read 2026-10-07:

- Networks: every public network exposes a node, an indexer (GraphQL over HTTP and WebSocket), and a local proof server on port 6300. https://docs.midnight.network/guides/networks-and-environments
- Indexer API v4: `contractAction(address)` returns `ContractDeploy`, `ContractCall`, or `ContractUpdate`, with `state`, `zswapState`, and `unshieldedBalances`. Subscriptions use `contractActions`. https://docs.midnight.network/api-reference/midnight-indexer
- Local network: indexer container `midnight-indexer`, GraphQL `http://localhost:8088/api/v4/graphql`, WebSocket `ws://localhost:8088/api/v4/graphql/ws`, image `midnightntwrk/indexer-standalone` **4.0.1**. https://docs.midnight.network/guides/midnight-local-network
- Battleship test compose: image `midnightntwrk/indexer-standalone:4.3.3`, node URL `ws://node:9944`, network id `undeployed`, client URL `http://127.0.0.1:8088/api/v4/graphql`. https://docs.midnight.network/tutorials/bship/test-suite
- Indexer 4.3.3 notes: pairs with node 1.0.0; upgrading from 4.0.x needs a reset and re-index. https://docs.midnight.network/relnotes/midnight-indexer/midnight-indexer-4-3-3

The older reference at https://docs.midnight.network/develop/reference/midnight-api/midnight-indexer still shows `chainState` on contract actions. The v4 page uses `state` and `zswapState`. A query copied from the old page is not a v4 query.

This lab file does not start an indexer, does not call the public preprod indexer, and does not claim that indexer or node is fixed. Preview and preprod hosted endpoints are a separate cutoff (docs issue #1504).

Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Classifier: `packages/preprod-hello-stub/src/indexer-usability-gap.mjs`

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
