# Compact no-recursion invariant

Upstream: [midnightntwrk/midnight-docs#1387](https://github.com/midnightntwrk/midnight-docs/issues/1387)

Official reference: [Compact reference](https://docs.midnight.network/compact/reference/compact-reference).

The reference states that Compact is bounded: types have fixed sizes, loops are bounded by constants or by the size of a constant-size object, and **recursion is disallowed**. The compiler must produce finite proving circuits.

A circuit must not call itself. This lab sample records the rule without compiling or deploying.

`contracts/hello-midnight/no-recursion.compact` shows a non-recursive `increment` circuit with the language pin `>= 0.23`. It is not compiled here.

`packages/preprod-hello-stub/src/no-recursion-invariant.mjs` exports `checkNoRecursion(source)`. It extracts circuit names and flags any circuit whose body appears to call its own name more than once (the declaration counts as one). It does not invent APIs, does not call a proof server, and does not claim a fix of the public indexer or node.

Also read this run (open issues, not fixed here): servicedesk#264 (Stagenet validator stall), servicedesk#254 (faucet amount unit), midnight-docs#1587 (quickstart scaffolder), midnight-docs#1579 (JS runtime / deploy guides still on bboard), example-hello-world#41 (unused deps).

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Check: `node src/no-recursion-invariant.mjs` from `packages/preprod-hello-stub` (or pass a .compact path).

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
