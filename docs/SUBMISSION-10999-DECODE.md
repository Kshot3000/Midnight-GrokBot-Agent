# Five-digit submission codes (e.g. 10999) are not LedgerApiError u8 values

Upstream: [midnightntwrk/midnight-docs#1385](https://github.com/midnightntwrk/midnight-docs/issues/1385)

Official page (checked 2026-10-13): [Node error codes](https://docs.midnight.network/nodes/error-codes)

The node error codes page documents `LedgerApiError` codes mapped to `u8` (0–255). It now includes a **Transaction submission errors** section. Under **Codes above 255** the page states:

> Node ledger codes are `u8` values, so they're always between 0 and 255. If you see a larger number, such as a five-digit code, it didn't come from the node error tables on this page. Look for the `1010` response or the `Custom error: N` text elsewhere in the error chain, or check the node log.

Kapa traffic cited in #1385 included queries such as "what is the reason of this error in preprod network: Transaction submission error (code: 10999)". That five-digit code is not a node ledger code from the tables on the error-codes page. The outer text is typically the wallet SDK `SubmissionError` wrapper (`Transaction submission error`).

Official guidance on the same page:

- The `message` property of a `FiberFailure` holds only the outermost text.
- Convert the error with `String(error)` (or `console.error(error)` in Node.js) to see the full chain, which may contain `1010: Invalid Transaction: Custom error: N`.
- Browser consoles show only the outer message, so use `String(error)` there. `JSON.stringify(error)` drops the node error text.
- Look up the inner `u8` `N` in the error tables (codes for node version 1.0.x; numbers can change between releases — see the [compatibility matrix](https://docs.midnight.network/relnotes/support-matrix)).

This lab note does not patch midnight-docs and does not claim to fix the public Preprod node or indexer. The companion decoder classifies pasted strings only.

Check: `npm run check:submission-10999 -w @kshot/preprod-hello-stub`

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
