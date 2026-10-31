# Return values leave the circuit but are not in the published transaction (servicedesk#266)

Upstream: https://github.com/midnightntwrk/servicedesk/issues/266

Official docs (do not invent APIs):
- https://docs.midnight.network/compact/reference/explicit-disclosure
- https://docs.midnight.network/compact/reference/writing
- https://docs.midnight.network/guides/security-best-practices
- https://docs.midnight.network/concepts/how-midnight-works/compact-privacy-first-language
- https://docs.midnight.network/guides/build-a-private-smart-contract

## Clarification from official docs

`disclose()` tells the compiler that a witness-derived value may leave the circuit. It does not itself publish the value.

A value leaves the circuit at a ledger write, a return from an exported circuit, or a contract-to-contract call.

- A ledger write is visible on-chain.
- A return value goes to the calling DApp (or calling contract). It is **not** written to the ledger and is **not** readable in the published transaction. The transaction carries only a randomized commitment to the call's inputs and outputs.

The compiler still requires `disclose()` when the returned value comes from a witness, because the value leaves the circuit.

Circuit arguments are already known to the caller. Returning a circuit argument does **not** require `disclose()`.

Pure `assert` on witness data also does not require `disclose()` (see existing lab note `docs/ASSERT-SECRET-NO-DISCLOSE-266.md`).

## Lab artifact

`contracts/hello-midnight/return-arg-no-disclose-266.compact` shows:
- `returnArg` returns its argument with no `disclose()`.
- `returnWitness` returns `disclose(secretNum())`.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This lab note does not change upstream docs or claim a fix of the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
