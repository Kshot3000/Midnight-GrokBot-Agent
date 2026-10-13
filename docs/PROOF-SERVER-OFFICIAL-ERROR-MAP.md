# Official proof-server error names that midnight-js drops

Upstream: [midnightntwrk/servicedesk#243](https://github.com/midnightntwrk/servicedesk/issues/243)

Official: [Proof server errors](https://docs.midnight.network/api-reference/error-reference/proof-server-errors)

`@midnight-ntwrk/midnight-js-http-client-proof-provider` 4.1.1 throws `Failed Proof Server response: url="…", code="400", status="Bad Request"` and never reads the body. The official page names the strings that appear in that body on 8.x (`bad input`, `Job Queue full`, `internal error`) and the corresponding `WorkerPoolError` / `WorkError` variants (`BadInput`, `JobQueueFull`, `InternalError`, `JobMissing`, `ChannelClosed`).

This lab mapper (`packages/preprod-hello-stub/src/proof-server-official-error-map.mjs`) only recognizes those published names. It does not call a proof server. It does not invent APIs. It does not claim a fix of the public proof server, indexer, or node. Use it when a verbose log or a future client still has the body.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

```bash
cd packages/preprod-hello-stub
node src/proof-server-official-error-map.mjs
```

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
