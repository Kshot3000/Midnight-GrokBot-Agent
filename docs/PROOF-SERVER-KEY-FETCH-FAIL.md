# Proof-server key download "Giving up" (servicedesk#242)

Upstream: [midnightntwrk/servicedesk#242](https://github.com/midnightntwrk/servicedesk/issues/242)

Official: [Proving transactions locally](https://docs.midnight.network/guides/local-proving)

The `midnightntwrk/proof-server` image fetches about 34 MB of parameters and built-in keys before it binds its port. Each file gets 3 attempts with no pause between them. If all three fail the process exits with code 1 and a log line containing `Giving up.`

Clients then see connection refused or `ECONNRESET` and there is no `/health` yet to distinguish "starting" from "down".

This lab does not run Docker and does not claim a fix of the public proof server, indexer, or node.

## Lab classifier

`packages/preprod-hello-stub/src/proof-server-key-fetch-fail.mjs` inspects a log string:

```js
import { classifyKeyFetchFail } from './proof-server-key-fetch-fail.mjs';

const decoded = classifyKeyFetchFail(dockerLogs);
// decoded.kind === 'key-download-gave-up' | 'unrecognized'
// decoded.hint mentions the volume at /.cache/midnight
```

Self-check:

```bash
node packages/preprod-hello-stub/src/proof-server-key-fetch-fail.mjs
```

Workaround (from the issue, not an image fix): mount a volume at `/.cache/midnight` so completed files survive a restart and only the missing ones are fetched again. Set `MIDNIGHT_PARAM_SOURCE` only when you control a mirror.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
