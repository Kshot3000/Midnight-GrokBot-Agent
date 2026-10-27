# Open upstream issues sweep (2026-10-27)

This lab read open issues in midnightntwrk/servicedesk, midnightntwrk/midnight-docs, and midnightntwrk/example-hello-world. It cannot push to those orgs. It does not claim any public indexer, node, or compiler fix. Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Official docs only: https://docs.midnight.network/.

## midnightntwrk/servicedesk (open, selected)

- [#267](https://github.com/midnightntwrk/servicedesk/issues/267) — Which node build does Blockfrost preprod RPC run? It reports "2.1.0-00000000000". Lab: `docs/BLOCKFROST-PREPROD-NODE-VERSION.md`.
- [#266](https://github.com/midnightntwrk/servicedesk/issues/266) — Explicit disclosure: circuit return values are not in the published transaction, and returning a circuit argument needs no disclose(). Lab: `docs/RETURN-VALUE-NOT-ON-CHAIN.md`, `contracts/hello-midnight/return-value-disclose.compact`.
- [#254](https://github.com/midnightntwrk/servicedesk/issues/254) — Faucet POST /drips multiplies amount by 5 tNIGHT. Lab: `docs/FAUCET-AMOUNT-UNIT.md`.
- [#249](https://github.com/midnightntwrk/servicedesk/issues/249) — pure circuits in contract types compile but every call is refused. Lab: `docs/PURE-INTERFACE-CIRCUIT-GAP.md`.

## midnightntwrk/midnight-docs (open, selected)

- [#1587](https://github.com/midnightntwrk/midnight-docs/issues/1587) — Replace the Quickstart page's create-mn-app content with the new midnight-examples scaffolder (BLOCKED). Lab: `docs/QUICKSTART-SCAFFOLDER-GAP.md`.
- [#1569](https://github.com/midnightntwrk/midnight-docs/issues/1569) — Wallet and connector pages: stale lines. Lab: `docs/WALLET-CONNECTOR-STALE-LINES.md`.
- [#1564](https://github.com/midnightntwrk/midnight-docs/issues/1564) — Compact runtime API reference documents 0.20.0, but networks run 0.16.0. Lab: `docs/COMPACT-RUNTIME-API-VERSION-GAP.md`.
- [#1487](https://github.com/midnightntwrk/midnight-docs/issues/1487) — Test and debug page code samples don't run as written. Lab: `docs/TEST-AND-DEBUG-SAMPLES-GAP.md`.
- [#1383](https://github.com/midnightntwrk/midnight-docs/issues/1383) — Document proving topology. Lab: `docs/PROVING-TOPOLOGY.md`.

## midnightntwrk/example-hello-world (open)

- [#41](https://github.com/midnightntwrk/example-hello-world/issues/41) — remove unused axios and testcontainers. Lab: `docs/HELLO-WORLD-UNUSED-DEPS.md`.
- [#13](https://github.com/midnightntwrk/example-hello-world/issues/13) — Dependency Dashboard (Renovate).

This sweep only records published issues and existing lab notes. It does not invent APIs.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
