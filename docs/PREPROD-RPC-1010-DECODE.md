# Preprod submit errors that hide RPC 1010

Upstream: [midnightntwrk/servicedesk#225](https://github.com/midnightntwrk/servicedesk/issues/225)

midnight-js 4.1.1 `submitTx` can reject with an Effect `FiberFailure` whose `message` is only `Transaction submission error` and whose `.cause` is `undefined`. The node text, for example `1010: Invalid Transaction: Transaction would exhaust the block limits`, is on a symbol-keyed Effect cause (`wallet-sdk-capabilities` 3.3.1 wraps the RPC error). Official Compact and proof-server docs do not add an RPC method for this. This lab only decodes the strings the node already returns.

`packages/preprod-hello-stub/src/rpc-errors.mjs` walks own properties and symbol values, then names RPC 1010 when that text is present. It does not fix the public Preprod indexer or node. Related open reports: [#230](https://github.com/midnightntwrk/servicedesk/issues/230) (indexer tip lag) and [#226](https://github.com/midnightntwrk/servicedesk/issues/226) (subset deploy when a contract is too heavy for one transaction).

Pins used by this lab: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Proof server start command is the documented one: `docker run -p 6300:6300 midnightntwrk/proof-server:8.1.0 midnight-proof-server -v` (https://docs.midnight.network/getting-started/installation).

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
