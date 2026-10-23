# Disclosure sites: ledger write vs circuit return vs assert

Upstream: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official pages (do not invent):

- https://docs.midnight.network/compact/reference/explicit-disclosure
- https://docs.midnight.network/guides/security-best-practices (On-chain visibility)
- https://docs.midnight.network/compact/reference/writing (Confidentiality)

Issue #266 (Compact toolchain ~0.31.1 / language ~0.23, also checked on 0.35.0) reports that the explicit-disclosure page can be read as treating a returned value the same as a ledger write. Official security and writing pages already separate the cases:

| Site | disclose() required? | Visible in published transaction? |
| --- | --- | --- |
| Ledger write of witness-derived value | Yes | Yes (the written value) |
| Return of a witness from an exported circuit | Yes | No — only a randomized commitment to inputs/outputs; value reaches the calling DApp (`callTx.private.result`) or a calling contract |
| Return of an exported-circuit argument | No (caller already knows it) | No |
| `assert` on a secret | No (implicit) | No |
| Branch on a witness that then writes the ledger | Yes (disclose the Boolean or the written value) | Yes for the ledger write that runs |
| Circuit argument used as a Map key | Yes | Yes (Map key is a ledger operation argument) |

`disclose()` itself does not publish a value. It only clears the compiler’s private-data check so the value may leave the circuit.

Lab sample: `contracts/hello-midnight/disclosure-sites.compact` shows the accepted forms. Source only; not compiled or deployed here. This lab does not claim a fix of the public docs, compiler, indexer, or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
