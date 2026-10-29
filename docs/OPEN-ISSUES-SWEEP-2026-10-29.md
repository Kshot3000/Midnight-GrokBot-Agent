# Open issues sweep (2026-10-29)

This lab note records the open issues read this run from the three upstream repos. It does not edit those orgs, does not claim a fix of the public indexer or node, and invents no APIs. Official docs only: https://docs.midnight.network/. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

## midnightntwrk/servicedesk (open)

- #267 [Help]: Which node build does Blockfrost preprod RPC run? It reports "2.1.0-00000000000", which matches no release.  
  Lab: `docs/BLOCKFROST-PREPROD-NODE-VERSION.md`, `packages/preprod-hello-stub/src/blockfrost-preprod-node-version.mjs`. Matrix pins Preprod node 1.0.400 / runtime specVersion 1000300.  
  Official: https://docs.midnight.network/relnotes/support-matrix

- #266 Explicit disclosure: circuit return values are not in the published transaction, and returning a circuit argument needs no disclose().  
  Lab: `docs/DISCLOSURE-RETURN-VS-LEDGER-266.md`, `contracts/hello-midnight/disclosure-return-vs-ledger-266.compact`.  
  Official: https://docs.midnight.network/compact/reference/explicit-disclosure

- #254 [Bug]: Faucet POST /drips multiplies amount by 5 tNIGHT.  
  Lab: faucet unit notes already present. Official faucet pages describe tNIGHT units.

- #251 [Bug]: Wallet SDK DUST sync never notices a subscription that stays open but stops delivering events.  
  Lab: `docs/DUST-SILENT-SUBSCRIPTION.md`, `packages/preprod-hello-stub/src/dust-silent-subscription-classify.mjs`.  
  Related docs request: midnight-docs#1381. Official: https://docs.midnight.network/guides/networks-and-environments (sync troubleshooting table).

- #249 [Docs]: pure circuits in contract types compile but every call is refused (PureInterfaceCircuit).  
  Lab: `docs/PURE-INTERFACE-CIRCUIT-GAP.md`, `contracts/hello-midnight/no-pure-interface.compact`.  
  Note: reported against 0.35.0 / runtime 0.20.0; this lab pins 0.31.1 / 0.16.0.

- #243 [Bug]: midnight-js proof provider drops the proof server's error message, and reports a timeout as "The user aborted a request."  
  Lab: `docs/PROOF-PROVIDER-ERROR-DECODE-243.md`, `packages/preprod-hello-stub/src/proof-provider-error-decode-243.mjs`.  
  Pins midnight-js 4.1.1 / proof-server 8.1.0.

## midnightntwrk/midnight-docs (open)

- #1587 Replace the Quickstart page's `create-mn-app` content with the new `midnight-examples` scaffolder (BLOCKED on midnight-examples#59).  
  Lab: `docs/QUICKSTART-SCAFFOLDER-BLOCKED.md`. Official quickstart still describes create-mn-app until the tool is published.

- #1564 Compact runtime API reference documents 0.20.0, but the networks run 0.16.0.  
  Lab: `docs/COMPACT-RUNTIME-API-016-GAP.md`. Official matrix: Compact runtime 0.16.0 for Preprod/Preview/Mainnet.  
  https://docs.midnight.network/relnotes/support-matrix

- #1487 Test and debug page: code samples don't run as written.  
  Lab: `packages/preprod-hello-stub/src/test-debug-sample-gap.mjs`. Working pattern is in https://docs.midnight.network/guides/compact-javascript-runtime (createCircuitContext, ledger(call.context.currentQueryContext.state), callTx already finalized).

- #1381 Add a troubleshooting page for wallet sync stalls on Preprod.  
  Lab: `packages/preprod-hello-stub/src/wallet-sync-stall-classify.mjs`. Restates only causes already on the networks guide.

## midnightntwrk/example-hello-world (open)

- #41 chore: remove unused dependencies (axios, testcontainers).  
  Lab note only; this repo does not edit the example. Pins remain midnight-js 4.1.1.

- #13 Dependency Dashboard (Renovate). No action in this lab.

## Lab action this run

No public indexer, node, or docs fix is claimed. Builders on the pinned stack should prefer the support matrix over the 0.20.0 API reference and the JS runtime guide over the test-and-debug samples until those pages are updated.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
