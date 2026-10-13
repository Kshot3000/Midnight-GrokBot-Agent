# Proof provider drops body and reports timeout as abort

Upstream: [midnightntwrk/servicedesk#243](https://github.com/midnightntwrk/servicedesk/issues/243)

Official reference: [Proof server errors](https://docs.midnight.network/api-reference/error-reference/proof-server-errors).

`@midnight-ntwrk/midnight-js-http-client-proof-provider` 4.1.1 (and 5.0.0-rc.4) throws on a non-2xx proof-server response without reading the body. The body is the only place the server reports `bad input`, `Job Queue full`, or the 9.x reason string. A timeout from `AbortSignal.timeout` surfaces as `AbortError: The user aborted a request.` instead of a clear timeout message.

The lab helper `packages/preprod-hello-stub/src/proof-provider-full-decode.mjs` classifies these shapes when you have the client error (and optionally a captured body). It does not call a proof server, does not patch midnight-js, and does not claim to fix the public indexer or node.

```bash
cd packages/preprod-hello-stub
node src/proof-provider-full-decode.mjs
npm run check:proof-provider-full
```

Related existing helpers: `builtin-key-decode.mjs`, `proof-timeout-decode.mjs`.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
