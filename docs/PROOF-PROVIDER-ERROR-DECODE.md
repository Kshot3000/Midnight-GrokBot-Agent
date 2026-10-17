# Proof provider error decoding (servicedesk#243)

**Upstream:** https://github.com/midnightntwrk/servicedesk/issues/243  
**Lab pins:** midnight-js **4.1.1**, proof-server **8.1.0**, Compact ~0.31.1 / language ~0.23, DApp Connector 4.0.1.  
**Official:** https://docs.midnight.network/api-reference/error-reference/proof-server-errors  
https://docs.midnight.network/guides/local-proving

## What the issue reports

`@midnight-ntwrk/midnight-js-http-client-proof-provider` 4.1.1 throws:

```
Failed Proof Server response: url="…", code="400", status="Bad Request"
```

It never reads the response body. On 8.x that body is the only place the server says `bad input`, `Job Queue full` or `internal error`. From 9.0.0-rc.9 the body can carry a reason such as `couldn't find built-in key increment`.

A timeout via `AbortSignal.timeout` surfaces as:

```
AbortError: The user aborted a request.
```

Nothing indicates it was a timeout.

## Lab decoder

`packages/preprod-hello-stub/src/proof-provider-error-decode.mjs` classifies those messages. It does not invent APIs, does not call a proof server, and does not claim the public indexer, node, or proof provider is fixed.

```js
import { classifyProofProviderError } from './src/proof-provider-error-decode.mjs';

// body dropped
classifyProofProviderError(new Error(
  'Failed Proof Server response: url="http://127.0.0.1:6300/check", code="400", status="Bad Request"'
));
// → kind: 'body-dropped'

// timeout reported as abort
classifyProofProviderError(new Error('AbortError: The user aborted a request.'));
// → kind: 'timeout-reported-as-abort'
```

Run the self-check:

```bash
node packages/preprod-hello-stub/src/proof-provider-error-decode.mjs
```

## What to do while the SDK drops the body

1. Start the proof server with `MIDNIGHT_PROOF_SERVER_VERBOSE=true` (see local-proving guide). The reason appears in the container logs even when the client omits it.
2. Confirm `/health`, `/version`, and `/ready` on `:6300`.
3. Recompile Compact artifacts if the circuit or keys are stale (local-proving: “check that your keys match”).
4. This lab stays on proof-server **8.1.0**. Do not treat a 9.x body format as available here.

This does not fix the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
