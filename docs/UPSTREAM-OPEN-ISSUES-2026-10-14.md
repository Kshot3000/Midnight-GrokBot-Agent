# Upstream open issues snapshot (2026-10-14)

Read this run: open issues in midnightntwrk/servicedesk, midnightntwrk/midnight-docs, and midnightntwrk/example-hello-world. This lab does not push to those orgs. Official source of truth remains https://docs.midnight.network/.

## midnightntwrk/servicedesk

- [#252](https://github.com/midnightntwrk/servicedesk/issues/252) — proof-server 9.0.0-rc.9 DUST-spend proofs rejected by Stagenet node 2.0.0 with 1010 Custom error 170 (InvalidDustSpendProof). Workaround: stay on proof-server 9.0.0-rc.5 or the lab pin 8.1.0. See also docs/DUST-SPEND-PROOF-170.md.
- Silent DUST subscription stall in wallet SDK (indexer stream stays open but stops delivering). Wallet never notices. Related lab note: docs/DUST-SILENT-SUBSCRIPTION.md.

## midnightntwrk/midnight-docs

- [#1527](https://github.com/midnightntwrk/midnight-docs/issues/1527) — proof-server docker run and Compose commands silently drop flags (-v, --network, --port) because the image entrypoint is bash -c. Official pages still show the broken form. Use environment variables instead. Lab notes: docs/PROOF-SERVER-DOCKER-FLAGS.md and docs/PROOF-SERVER-FLAGS-DROP.md. Related servicedesk#242.
- [#1487](https://github.com/midnightntwrk/midnight-docs/issues/1487) — Test and debug page samples do not run against Compact runtime 0.16.0 / midnight-js 4.1.1 (hand-built CircuitContext, wrong assert strings, retired Counter links). Follow the working pattern on the JavaScript runtime guide. Lab: docs/CIRCUIT-CONTEXT-SAMPLE.md.
- [#1396](https://github.com/midnightntwrk/midnight-docs/issues/1396) — Sunset Midnight Academy links and expand Hello World into the main quick start.
- [#1383](https://github.com/midnightntwrk/midnight-docs/issues/1383) — Document proving topology (local vs wallet-delegated vs hosted). Privacy implication: never send witnesses to a third-party proof server.
- [#1381](https://github.com/midnightntwrk/midnight-docs/issues/1381) — Troubleshooting page needed for wallet sync stalls on Preprod.

## midnightntwrk/example-hello-world

- [#41](https://github.com/midnightntwrk/example-hello-world/issues/41) — Remove unused dependencies axios and testcontainers.
- Dependency dashboard (#13) tracks updates; lab stays pinned to midnight-js 4.1.1, proof-server 8.1.0, Compact ~0.31.1 / language ~0.23, DApp Connector 4.0.1.

Pins used by this lab (do not invent newer APIs):

- Compact ~0.31.1 / language ~0.23
- midnight-js 4.1.1
- DApp Connector 4.0.1
- proof-server 8.1.0

This note does not claim any fix of the public indexer, node, or proof-server image. It only helps builders locate the open upstream reports and the corresponding lab workarounds in docs/ and packages/preprod-hello-stub/.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
