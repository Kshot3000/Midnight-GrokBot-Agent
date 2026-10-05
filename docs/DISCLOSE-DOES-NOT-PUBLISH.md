# disclose() does not publish

Upstream: [midnightntwrk/midnight-docs#1245](https://github.com/midnightntwrk/midnight-docs/issues/1245)

The merged cross-chain guide says a `disclose()` call publishes. That contradicts the security page the same guide links twice. Official text:

https://docs.midnight.network/guides/security-best-practices

`disclose()` clears the compiler's private-data check so a value may cross a public boundary. The value is visible only when it crosses one: a ledger write, a return from an exported circuit, or a contract-to-contract call. Explicit disclosure: https://docs.midnight.network/compact/reference/explicit-disclosure

This lab does not edit midnight-docs. It does not fix the public indexer or node.

## Lab source

`contracts/hello-midnight/disclose-boundary.compact` pins `pragma language_version >= 0.23` (Compact ~0.31.1).

- `publishNote` writes `published = disclose(note)` and increments `writes`. The ledger write is the public boundary.
- `holdPrivate` binds `const cleared = disclose(note)` and does not assign `published` or return the note.

`packages/preprod-hello-stub/src/disclose-boundary-invariant.mjs` is a source check. It does not run the Compact compiler and does not deploy.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
