# Open upstream issues recorded 2026-10-27

This lab note records the open issues read from the three official orgs on this run. It does not invent APIs, does not claim any public fix, and does not push to those orgs.

## midnightntwrk/servicedesk (open)

- #267 [Help]: Which node build does Blockfrost preprod RPC run? It reports "2.1.0-00000000000"
- #266 Explicit disclosure: circuit return values are not in the published transaction, and returning a circuit argument needs no disclose()
- #254 [Bug]: Faucet POST /drips multiplies amount by 5 tNIGHT
- #249 [Docs]: pure circuits in contract types compile but every call is refused
- #243 [Bug]: midnight-js proof provider drops the proof server's error message
- #242 [Bug]: proof-server image silently drops command-line flags
- #252 [Bug]: proof-server 9.0.0-rc.9 DUST-spend proofs rejected by Stagenet node
- #251 [Bug]: Wallet SDK DUST sync never notices a subscription that stays open but stops delivering events
- #236 [Bug]: midnight-js deploy construction fails with errors that don't name the cause when the contract's runtime differs
- #213 Feature request: capture an allocated shielded-coin Merkle index without persisting the full coin
- #194 [Bug]: WalletFacade balance/finalization pins CPU and grows RSS indefinitely
- #193 [Bug]: Faucet server crashes on bare "/api" request
- #186 TransactionResult.successfulSegments is inverted
- #117 [Bug]: Contract unshielded-token ops rejected by FeeCalculation(OutsideTimeToDismiss)
- #99 [Bug]: WalletFacade.initSwap returns partial transactions for mixed shielded/unshielded swaps
- #24 Dependency Dashboard

## midnightntwrk/midnight-docs (open)

- #1587 Replace the Quickstart page's create-mn-app content with the new midnight-examples scaffolder
- #1569 Wallet and connector pages: stale lines found in the wallet guide review
- #1564 Compact runtime API reference documents 0.20.0, but the networks run 0.16.0
- #1487 Test and debug page: code samples don't run as written
- #1383 Document proving topology: local vs wallet-delegated vs hosted proof server
- #1381 Add a troubleshooting page for wallet sync stalls on Preprod
- #1377 Kapa traffic review (Aug to Sep 2026): documentation gaps
- #1245 Follow-up: review findings on the two EffectStream guides
- #1092 [Aura→BABE] DOC-03 — Docs update
- #902 Documentation: surface ownPublicKey() warning on auto-synced reference pages
- #834 Dependency Dashboard
- #831 Missing Wallet SDK API reference
- #285 Add a guide to running your own indexer against your own node
- #63 Clarify Distinction Between MerkleTree.insert() and MerkleTree.insertHash() API

## midnightntwrk/example-hello-world (open)

- #41 chore: remove unused dependencies (axios, testcontainers)
- #13 Dependency Dashboard

Lab stand-ins for several of these already exist under contracts/hello-midnight/, packages/preprod-hello-stub/, and docs/. This note is the daily open-issue snapshot for the pinned stack.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
