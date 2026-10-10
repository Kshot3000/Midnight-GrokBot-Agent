# Proof-provider error body drop (servicedesk#243)

Lab decoder for the midnight-js proof provider behavior reported in
[midnightntwrk/servicedesk#243](https://github.com/midnightntwrk/servicedesk/issues/243).

## What the upstream issue says

`@midnight-ntwrk/midnight-js-http-client-proof-provider` 4.1.1 (and 5.0.0-rc.4) throws

```
Failed Proof Server response: url="…", code="400", status="Bad Request"
```

without reading the response body. On proof-server 8.x the body is the only place that
says `bad input`, `Job Queue full`, or `internal error`. From 9.x the body also carries
the reason, e.g. ``bad input: `couldn't find built-in key increment` ``.

A timeout is reported as `AbortError: The user aborted a request.` instead of a
timeout message.

Official error names and status codes live at
[Proof server errors](https://docs.midnight.network/api-reference/error-reference/proof-server-errors).

## Lab helper

`packages/preprod-hello-stub/src/proof-provider-body-decode.mjs` classifies the two
wrappers so a caller can surface a useful hint without inventing an API.

```js
import { decodeProofProviderError } from './proof-provider-body-decode.mjs';

const decoded = decodeProofProviderError(err);
// decoded.kind === 'http-error-body-dropped' | 'timeout-or-abort' | 'unrecognized'
// decoded.bodyDropped, decoded.status, decoded.hint, decoded.upstream
```

Run the self-check:

```bash
node packages/preprod-hello-stub/src/proof-provider-body-decode.mjs
```

## Pins (unchanged)

- Compact ~0.31.1 / language ~0.23
- midnight-js 4.1.1
- DApp Connector 4.0.1
- proof-server 8.1.0

This does **not** fix the public indexer, node, or the upstream midnight-js package.
It is a local decoding aid that cites the open servicedesk issue.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
