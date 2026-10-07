# Bulletin-board failed assert is wrapped, and the test samples expect the wrong text

Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1487

The open docs issue says the Test and debug page expects `'Board is occupied'`, `'Board is vacant'`, and `'Not authorized'`. Those are not the bulletin board contract messages. The live example prints a different wrapper, and it still starts an older proof server. This lab note only decodes those published strings. It does not patch midnight-docs, the public indexer, or the node.

## What the pages say

Example CLI failure: https://docs.midnight.network/examples/dapps/bboard

```
Found error 'Unexpected error executing scoped transaction '<unnamed>': Error: failed assert: Attempted to post to an occupied board'
```

The same page's contract uses three assert messages:

- `Attempted to post to an occupied board`
- `Attempted to take down post from an empty board`
- `Attempted to take down post, but not the current owner`

That example starts `midnightntwrk/proof-server:8.0.3`. The install page starts `midnightntwrk/proof-server:8.1.0`: https://docs.midnight.network/getting-started/installation

Proof-server HTTP names (`BadInput`, `JobQueueFull`, `ChannelClosed`, and the other worker-pool and work errors) are a different class: https://docs.midnight.network/api-reference/error-reference/proof-server-errors

## Lab check

`packages/preprod-hello-stub/src/assert-fail-decode.mjs` unwraps the scoped-transaction string, maps the three contract messages, rejects the stale sample expectations from midnight-docs#1487, and flags the example image `8.0.3` against the install pin `8.1.0`. `node --test test/assert-fail-decode.test.mjs` covers it. LOCAL-TRUE. No deploy is claimed.

Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
