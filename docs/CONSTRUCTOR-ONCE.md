# At most one Compact constructor

Upstream: [midnightntwrk/midnight-docs#1387](https://github.com/midnightntwrk/midnight-docs/issues/1387)

Official reference: [Compact reference](https://docs.midnight.network/compact/reference/compact-reference). It says a Compact program can contain the definition of at most one constructor, called when the contract is created to initialize public and private state.

#1387 also records that Kapa could not answer how to declare an event type and use `emit`. The official stdlib ([exports](https://docs.midnight.network/compact/standard-library/exports)) says events are struct types emitted with `emit`. This lab sample does not emit. It only shows the constructor limit.

`contracts/hello-midnight/constructor-once.compact` has one constructor and the language pin `>= 0.22 && <= 0.23`. It is not compiled here. `packages/preprod-hello-stub/src/constructor-once.mjs` counts `constructor(` outside comments. Two constructors fail the check. Zero is allowed. This does not fix the public indexer or node.

Also read this run: servicedesk#223 (preprod RPC head moves backwards), servicedesk#236 (deploy errors that hide a runtime mismatch), example-hello-world#41 (unused axios and testcontainers). Not fixed here.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Check: `node src/constructor-once.mjs` from `packages/preprod-hello-stub`.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
