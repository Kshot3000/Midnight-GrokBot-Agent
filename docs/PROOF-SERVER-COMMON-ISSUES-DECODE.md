# Proof server common issues decode (servicedesk#243)

Upstream issue: [midnightntwrk/servicedesk#243](https://github.com/midnightntwrk/servicedesk/issues/243)

Official docs only (do not invent APIs):

- https://docs.midnight.network/api-reference/error-reference/proof-server-errors
- https://docs.midnight.network/guides/local-proving
- https://docs.midnight.network/relnotes/support-matrix

## Reported problem on midnight-js 4.1.1

The HTTP client proof provider throws `Failed Proof Server response: url="…", code="400", status="Bad Request"` and never reads the response body. The body is the only place the proof server says what went wrong.

On proof-server 8.x the body is typically `bad input`, `Job Queue full`, or an internal error string. A timeout surfaces as `AbortError: The user aborted a request.` with no indication that a timeout fired.

The fix is tracked in midnight-js#1459. Until it ships, enable verbose logging on the proof server and raise the provider timeout.

## Official common issues (quoted from the error reference)

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| 429 responses | Too many concurrent proof requests | Reduce parallel requests; exponential backoff |
| 503 from /ready | All proof workers are busy | Wait or increase worker count |
| 500 with "BadInput" | Malformed transaction data | Verify the transaction was built correctly with the SDK |
| Connection refused on port 6300 | Proof server not running | Start the proof server container |
| Slow proof generation | Large circuit or insufficient resources | Allocate more CPU or memory |

Work errors also include `BadInput(String)` on 400 and `InternalError(String)` on 500.

## Lab decoder

`packages/preprod-hello-stub/src/proof-server-common-issues-decode.mjs` classifies the shapes reported in #243 against the official table. It does not call a proof server, wallet, indexer, or node. LOCAL-TRUE. This lab does not claim a fix of the public proof server, midnight-js, indexer, or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
