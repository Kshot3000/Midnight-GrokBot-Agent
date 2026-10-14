# Latest open upstream issues sweep (2026-10-14)

This lab read open issues in the three orgs it cannot push to. It does not claim any public indexer, node, or compiler fix. Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Official docs only: https://docs.midnight.network/.

## midnightntwrk/servicedesk (open)
- [#251](https://github.com/midnightntwrk/servicedesk/issues/251) — Wallet SDK DUST sync never notices a subscription that stays open but stops delivering events. Lab: `docs/DUST-SILENT-SUBSCRIPTION.md`, `packages/preprod-hello-stub/src/dust-silent-subscription.mjs`.
- [#249](https://github.com/midnightntwrk/servicedesk/issues/249) — pure circuits in contract types compile but every call is refused; CoIP 4 omits PureInterfaceCircuit. Lab: `docs/PURE-INTERFACE-CIRCUIT.md`, `contracts/hello-midnight/no-pure-interface.compact`, `packages/preprod-hello-stub/src/pure-interface-invariant.mjs`.
- [#243](https://github.com/midnightntwrk/servicedesk/issues/243) — midnight-js proof provider drops the proof-server response body and reports a timeout as AbortError. Lab: `docs/PROOF-PROVIDER-BODY-DECODE.md`, `packages/preprod-hello-stub/src/proof-provider-body-decode.mjs`.
- [#242](https://github.com/midnightntwrk/servicedesk/issues/242) — proof-server image silently drops command-line flags and exits on three failed key downloads. Lab: `docs/PROOF-SERVER-IMAGE-FLAGS.md`, `docs/PROOF-SERVER-KEY-DOWNLOAD.md`, `docs/PROOF-SERVER-START-COMMAND.md`.
- [#236](https://github.com/midnightntwrk/servicedesk/issues/236) — deploy construction errors do not name a runtime mismatch. Lab: `docs/RUNTIME-MISMATCH-DECODE.md`.
- [#225](https://github.com/midnightntwrk/servicedesk/issues/225) — RPC 1010 “Transaction would exhaust the block limits” surfaces only as a generic submission error. Lab: `docs/PREPROD-RPC-1010-DECODE.md`.
- [#193](https://github.com/midnightntwrk/servicedesk/issues/193) — Preprod faucet crashes on bare "/api" due to unguarded null regex match. Lab: `docs/FAUCET-BARE-API-CRASH.md`, `packages/preprod-hello-stub/src/faucet-bare-api.mjs`.

## midnightntwrk/midnight-docs (open)

- [#1527](https://github.com/midnightntwrk/midnight-docs/issues/1527) — docs still show docker/Compose forms that drop `-v`, `--network`, `--port`. Matrix lists proof-server 8.1.3 while pages pin 8.1.0. Lab: `docs/PROOF-SERVER-START-COMMAND.md` (updated 2026-10-14).
- [#1487](https://github.com/midnightntwrk/midnight-docs/issues/1487) — Test and debug page samples do not run as written. Lab: `docs/TEST-DEBUG-SAMPLE-GAP.md`.
- [#1387](https://github.com/midnightntwrk/midnight-docs/issues/1387) — Compact reference gaps (Either, bitwise, circuit count, kernel.caller, emit, networkId, deserialize). Lab notes under `docs/` and samples under `contracts/hello-midnight/`.
- [#1385](https://github.com/midnightntwrk/midnight-docs/issues/1385) — node error-codes page missing submission-layer codes such as 10999. Lab: `docs/NODE-SUBMISSION-10999.md`.

## midnightntwrk/example-hello-world (open)

- [#41](https://github.com/midnightntwrk/example-hello-world/issues/41) — unused axios and testcontainers dependencies. Lab: `docs/HELLO-WORLD-UNUSED-DEPS.md`.

This sweep does not invent APIs. It only points builders at the official pages and the lab’s local classifiers.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
