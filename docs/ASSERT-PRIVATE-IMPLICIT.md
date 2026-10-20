# Assert on private data is implicitly allowed (no disclose required)

Upstream related: [midnightntwrk/midnight-docs#1487](https://github.com/midnightntwrk/midnight-docs/issues/1487)

Official:

- https://docs.midnight.network/compact/explicit_disclosure
- https://docs.midnight.network/compact/reference/compact-reference
- https://docs.midnight.network/guides/security-best-practices

From the explicit disclosure page: private data used only to compute the boolean value of an `assert` subexpression is allowed without an explicit `disclose()`. The assert itself may disclose the fact that the condition held or failed, but the compiler does not require a `disclose()` wrapper for the private expression inside the assert.

A ledger write, an exported-circuit return, or a cross-contract argument still requires `disclose()`.

Lab sample: `contracts/hello-midnight/assert-private-ok.compact` keeps the private key and derived public key private for the assert, then discloses only at the ledger assignment. It does not invent APIs. Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This lab does not claim a fix of the public docs site, indexer, or node.

Also read this run: servicedesk#254 (faucet amount unit), servicedesk#252 (proof-server 9.0.0-rc.9 DUST proof 170), midnight-docs#1577 (bboard tutorial retirement), example-hello-world#41 (unused deps). None of those are fixed here.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
