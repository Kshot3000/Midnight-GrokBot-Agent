# Returned circuit values are not on-chain disclosures

Upstream: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official pages:

- https://docs.midnight.network/guides/security-best-practices#on-chain-visibility
- https://docs.midnight.network/compact/reference/explicit-disclosure
- https://docs.midnight.network/relnotes/support-matrix

Issue #266 observed that values returned from exported circuits (with or without `disclose()`) reach the calling DApp via `callTx.private.result` but do not appear in the published transaction's `raw` bytes. The official security guide now states the same fact:

> The return value of an exported circuit: No, the transaction carries only a randomized commitment to the call's inputs and outputs.

`disclose()` clears the compiler's private-data check so a witness-derived value may leave the circuit. It does not itself publish the value. A ledger write is what makes a value visible on chain.

Lab Compact sample: `contracts/hello-midnight/return-commitment-not-onchain.compact`

- `returnSecretMarker` returns a witness only after `disclose()`
- `returnArgMarker` returns its argument with no `disclose()`
- `storeMarker` writes to the ledger with `disclose()`

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. This lab does not claim a fix of the public docs, compiler, indexer, or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
