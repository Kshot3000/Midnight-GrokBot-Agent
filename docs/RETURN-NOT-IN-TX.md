# Exported circuit return values are not in the published transaction

Upstream: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official: https://docs.midnight.network/guides/security-best-practices  
and https://docs.midnight.network/compact/reference/explicit-disclosure

The security best practices page states that the return value of an exported circuit is not visible in the transaction; the transaction carries only a randomized commitment to the call's inputs and outputs. A return hands the value to the calling DApp (or a calling contract). `disclose()` is still required when the returned value comes from a witness, because the value leaves the circuit. Ledger writes of disclosed values are on-chain.

Issue #266 confirmed this on a local network (Compact 0.31.1 / language 0.23, midnight-js 4.1.1, proof-server 8.1.0):

- `return disclose(secretValue())` reaches `callTx.private.result` but the marker is absent from the transaction `raw` bytes.
- `return x` on an exported circuit argument is accepted by the compiler without `disclose()` and is likewise absent from the published transaction.
- A disclosed ledger write of the same marker is present in the transaction.

This lab does not claim a fix of the public docs, compiler, indexer, or node.

## Lab source

`contracts/hello-midnight/return-boundary.compact` pins `pragma language_version >= 0.23`.

- `returnArg` returns its argument without `disclose()`.
- `returnWitness` returns `disclose(secretMarker())`.
- `storeArg` writes `stored = disclose(x)`.

`packages/preprod-hello-stub/src/return-boundary-invariant.mjs` is a source check. It does not run the Compact compiler and does not deploy.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
