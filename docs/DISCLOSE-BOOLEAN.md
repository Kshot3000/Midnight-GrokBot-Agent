# Disclose the boolean, not the value

Upstream: [midnightntwrk/midnight-docs#1387](https://github.com/midnightntwrk/midnight-docs/issues/1387)

Kapa could not answer Compact reference questions (Either, bitwise operators, circuit limits, kernel, Merkle inserts, in-circuit networkId, deserialization typing, pragma form). The security guide already states the disclosure rule those pages do not surface.

Official source (do not invent an API): https://docs.midnight.network/guides/security-best-practices

- When you only need to prove a property, disclose the boolean result, not the value: `disclose(age >= 18)`.
- Comparisons like `>=` work on `Uint<N>`, not `Field`.
- `disclose()` does not publish by itself. An exported-circuit return and a ledger write are public positions, so only the comparison should cross them.

Lab contract: `contracts/hello-midnight/disclose-boolean.compact`

- `markAdult` takes `age: Uint<8>` and returns `Boolean`.
- It stores and returns `disclose(age >= 18)`. It does not write `age`.

`packages/preprod-hello-stub/src/disclose-boolean-invariant.mjs` is a source check only. It does not compile Compact, does not call proof-server 8.1.0, and does not claim a Preprod deploy. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This lab note does not fix the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
