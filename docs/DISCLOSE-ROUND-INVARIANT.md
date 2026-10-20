# Disclose + round counter invariant (lab)

Upstream: [midnightntwrk/midnight-docs#1487](https://github.com/midnightntwrk/midnight-docs/issues/1487)

Official writing guide (Compact language, not invented):
https://docs.midnight.network/compact/reference/writing

The guide's lock example discloses a persistentHash of a domain separator, the current `round` Counter (cast to Bytes), and a witness secret key. It increments `round` on clear so the same key is not linkable across rounds. The test-and-debug page samples (cited by #1487) omit `disclose()` and use shapes that do not compile against the supported Compact runtime.

This lab pins Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. The contract is source only.

## Lab stand-in

- `contracts/hello-midnight/disclose-round.compact` — `setAuthority` discloses `publicKey(round, sk)`; `rotate` asserts the match then `round.increment(1)`.
- `packages/preprod-hello-stub/src/disclose-round-invariant.mjs` — source check only. It does not compile, does not prove, and does not contact a node or indexer.

This note does not claim a fix of the public indexer, node, or docs site.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
