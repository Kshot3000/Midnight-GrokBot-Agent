# Compact return disclose invariant

Upstream: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official explicit disclosure:

https://docs.midnight.network/compact/reference/explicit-disclosure

A Compact program must declare disclosure before storing a value in the public ledger, returning it from an exported circuit, or passing it to another contract. Issue #266 reports that returning a circuit argument compiles without `disclose()`, while returning a witness value does not. On-chain probes show returned values reach the DApp result but are absent from published transaction bytes, unlike a disclosed ledger store.

Lab Compact samples (language pin ~0.23, not compiled in this commit):

- `contracts/hello-midnight/return-arg-no-disclose.compact`
- `contracts/hello-midnight/return-witness-disclose.compact`

`packages/preprod-hello-stub/src/return-disclose-invariant.mjs` is a source-level check for the expected patterns. It does not invoke the Compact compiler, does not prove, and does not deploy. This lab does not claim a fix of the public docs, indexer, or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
