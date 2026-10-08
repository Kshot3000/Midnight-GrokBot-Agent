# Fallible section needs kernel.checkpoint() first

Upstream: [midnightntwrk/midnight-docs#1387](https://github.com/midnightntwrk/midnight-docs/issues/1387)

Official docs, read 2026-10-08:

- Kernel `checkpoint(): []` marks execution so far as one atomic unit so a partial transaction failure can split across it. https://docs.midnight.network/compact/reference/ledger-adt
- Node Custom error **118 FallibleWithoutCheckpoint**: "Fallible transcript missing initial checkpoint." Fix text: add `kernel.checkpoint()` at the start of fallible sections. https://docs.midnight.network/nodes/error-codes

Issue #1387 records that Kapa could not answer which Kernel operations exist, including checkpoint. The ledger ADT page lists `checkpoint` as a Kernel operation. `kernel.self().bytes` is a field on the returned `ContractAddress`, not a Kernel method. This note does not add a new Compact API.

Lab check: `contracts/hello-midnight/fallible-checkpoint.compact` calls `kernel.checkpoint()` before `kernel.blockTimeGreaterThan`. `packages/preprod-hello-stub/src/fallible-checkpoint.mjs` flags a circuit marked `fallible section` when that call is missing or comes after another `kernel.` call. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This does not compile the contract, submit a transaction, or fix the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
