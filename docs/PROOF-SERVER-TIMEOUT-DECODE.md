# Proof server timeout reported as abort

Upstream: [midnightntwrk/servicedesk#243](https://github.com/midnightntwrk/servicedesk/issues/243)

Official proof-server errors: https://docs.midnight.network/api-reference/error-reference/proof-server-errors

`@midnight-ntwrk/midnight-js-http-client-proof-provider` 4.1.1 (and 5.0.0-rc.4) reports a timed-out proof request as `AbortError: The user aborted a request.` (or wrapped as `Proof Server request failed: url="…" <- AbortError: The user aborted a request.`). The error never says a timeout fired or how long it was.

This lab classifies that wrapper so a caller can surface a useful hint. It does not patch midnight-js, does not call a live proof server, and does not claim a fix of the public indexer or node.

```js
import { decodeProofTimeout } from './proof-timeout-decode.mjs';

const decoded = decodeProofTimeout(err, { timeoutMs: 300000 });
// decoded.kind === 'timeout-as-abort' | 'other'
// decoded.hint
```

Run:

```bash
node packages/preprod-hello-stub/src/proof-timeout-decode.mjs
```

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
