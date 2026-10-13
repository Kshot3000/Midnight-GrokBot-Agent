# Compact input bounds: assert before the ledger write

Upstream: [midnightntwrk/midnight-docs#1387](https://github.com/midnightntwrk/midnight-docs/issues/1387)

Official security guidance still tells builders to validate every circuit parameter before a ledger mutation:

- [Security and best practices](https://docs.midnight.network/guides/security-best-practices) — "Never trust witness data or circuit parameters without validation."
- [Smart contract security](https://docs.midnight.network/compact/smart-contract-security) — assertions give pre-condition checks, input validation, authorization, and invariant preservation.

#1387 recorded Compact reference gaps that Kapa could not answer (circuit limits, kernel operations, disclosure typing). The lab source `contracts/hello-midnight/assert-input-bounds.compact` copies the documented pattern for a bounded transfer:

1. Assert `amount > 0`.
2. Assert `amount <= MAX_TRANSFER`.
3. Only then write `stored = disclose(amount)`.

Compact toolchain 0.31.1 / language ~0.23 uses the function-like `assert(condition, "message")` form. This note does not invent an API, does not compile the contract, and does not claim a change to the public docs, indexer, or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
