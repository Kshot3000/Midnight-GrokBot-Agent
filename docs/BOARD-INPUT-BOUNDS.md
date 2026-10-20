# Board input bounds Compact invariant

Upstream pattern: [battleship smart contract tutorial](https://docs.midnight.network/tutorials/bship/smart-contract)

The battleship tutorial validates ship and shot positions with asserts before any state write:

```
assert(_x1 != _x2, "Cannot use the same number twice");
assert(_x1 > 0 && _x2 > 0, "No zero index, board starts at 1");
assert(_x1 <= 20 && _x2 <= 20, "Out of bounds, please keep ships on the board");
```

Security best practices require validating all inputs: https://docs.midnight.network/guides/security-best-practices

This lab adds a source-only Compact stand-in `contracts/hello-midnight/board-input-bounds.compact` that asserts `x > 0` and `x <= 20` then discloses into a ledger field. It is not compiled and is not a deploy.

`packages/preprod-hello-stub/src/board-bounds-invariant.mjs` classifies the source for the required asserts. Run `npm run check:board-bounds` in that package. This is local classification only.

Pins remain Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This run also read open issues: servicedesk#257 (mainnet contract deploys stay pending until TTL), servicedesk#254 (faucet amount unit), midnight-docs#1487 (test-and-debug samples do not run as written), midnight-docs#1564 (runtime API version gap). None of those are fixed here. This lab does not claim a fix of the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
