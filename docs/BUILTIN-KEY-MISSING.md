# Proof server "couldn't find built-in key" is dropped by midnight-js

Upstream: [midnightntwrk/servicedesk#243](https://github.com/midnightntwrk/servicedesk/issues/243)

Official reference: [Proof server errors](https://docs.midnight.network/api-reference/error-reference/proof-server-errors).

When the proof server rejects a `/check` because the circuit's ZKIR was not sent (or not readable), the body on 9.x is

```text
bad input: `couldn't find built-in key increment`
```

On 8.x it is only `bad input`. `@midnight-ntwrk/midnight-js-http-client-proof-provider` 4.1.1 never reads the body, so the reason is discarded. The lab decoder in `packages/preprod-hello-stub/src/builtin-key-decode.mjs` extracts the key name when the body is available (verbose log or a future client) and points builders at the ZKIR files.

It does not call a proof server, does not patch midnight-js, and does not claim to fix the public indexer or node.

```bash
cd packages/preprod-hello-stub
node src/builtin-key-decode.mjs
npm run check:builtin-key
```

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
