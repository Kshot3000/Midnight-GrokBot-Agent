# Proof provider error body drop and timeout-as-abort (servicedesk#243)

Classification helper for errors thrown by `@midnight-ntwrk/midnight-js-http-client-proof-provider` **4.1.1** when the proof server rejects a request or the request times out.

## Upstream

- **Issue:** https://github.com/midnightntwrk/servicedesk/issues/243
- **Title:** [Bug]: midnight-js proof provider drops the proof server's error message, and reports a timeout as "The user aborted a request."

## Official references

- https://docs.midnight.network/guides/local-proving (midnight-js 4.1.1, proof-server 8.1.3, Compact 0.31.1)
- https://docs.midnight.network/api-reference/error-reference/proof-server-errors

## What the helper does

`packages/preprod-hello-stub/src/proof-provider-error-decode.mjs` exports `decodeProofProviderError(error)`.

It recognises three patterns reported in the issue (and confirmed against the 4.1.1 source):

1. **response-body-dropped** — `Failed Proof Server response: url=…, code="400", status="Bad Request"` with no body. The provider never reads the response body. On proof-server 8.x the body is one of `bad input`, `Job Queue full`, or `internal error`. From 9.0.0-rc.9 it includes a reason such as ``couldn't find built-in key increment``.
2. **timeout-reported-as-abort** — `AbortError: The user aborted a request.` (from `AbortSignal.timeout`). The message does not say a timeout fired or the duration (default 300000 ms on prove).
3. **missing-builtin-key / bad-input / queue-full** — when a body *is* present in the sample string (the helper does not invent one).

## Pins

- Compact ~0.31.1 / language ~0.23
- midnight-js 4.1.1
- DApp Connector 4.0.1
- proof-server 8.1.0 (lab pin; issue also discusses 8.x / 9.x behaviour)

## Honest claim

LOCAL-TRUE classification of an already-observed error string.  
Does **not** fix the public midnight-js package, the proof server, the indexer, or the node.

## Usage

```js
import { decodeProofProviderError } from './proof-provider-error-decode.mjs';

const decoded = decodeProofProviderError(err);
// decoded.classification, decoded.hint, decoded.upstream
```

Run the self-check:

```bash
node packages/preprod-hello-stub/src/proof-provider-error-decode.mjs
```

Built by @kshot9000 https://x.com/kshot9000  
Email: kshot9000@gmail.com  
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v  
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
