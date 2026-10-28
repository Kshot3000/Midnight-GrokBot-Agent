# Faucet bare /api crash (servicedesk#193)

Upstream issue: [midnightntwrk/servicedesk#193](https://github.com/midnightntwrk/servicedesk/issues/193)

Official references (do not invent APIs):

- https://docs.midnight.network/guides/acquire-tokens
- https://docs.midnight.network/guides/networks-and-environments
- https://docs.midnight.network/relnotes/network

Issue #193 reports that the Preprod faucet server process crashes on a request whose path is bare `/api` or `/api/` (no further segment). The request-timing middleware uses a non-null assertion on a regex match that can be null, producing:

```
TypeError: Cannot read properties of null (reading 'groups')
```

The client receives a normal 404 first; the process then dies until it is restarted. This took the Preprod faucet down for about eight minutes on 2026-09-04.

This is a faucet-server bug, not a Compact, midnight-js, or DApp Connector issue. Builders who see the faucet UI or API stop responding can recognize the symptom from the log line above.

## Lab decoder

`packages/preprod-hello-stub/src/faucet-bare-api-crash-decode.mjs` classifies the error string. It does not call the faucet, does not invent endpoints, and does not claim to fix the public faucet.

```bash
cd packages/preprod-hello-stub
node src/faucet-bare-api-crash-decode.mjs
npm run check:faucet-bare-api
```

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
