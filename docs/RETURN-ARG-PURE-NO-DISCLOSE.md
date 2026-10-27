# Pure circuit return of arguments needs no disclose()

Upstream: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official explicit disclosure:

https://docs.midnight.network/compact/reference/explicit-disclosure

Issue #266 shows that a pure exported circuit returning the sum of its arguments compiles without `disclose()` on Compact 0.31.1 / language 0.23 (and 0.35.0). Returning a witness value is still rejected unless wrapped in `disclose()`. Arguments are known to the caller, so the compiler treats them differently from witness data.

Lab sample (source only, not compiled or deployed here):

- `contracts/hello-midnight/return-arg-pure-no-disclose.compact`

`packages/preprod-hello-stub/src/return-arg-pure-invariant.mjs` checks the expected source pattern. It does not invoke the compiler, prove, or deploy. This lab does not claim a fix of the public docs, indexer, or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
