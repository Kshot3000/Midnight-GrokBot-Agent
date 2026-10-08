# Compact Uint width stops at 248 bits

Upstream: [midnightntwrk/midnight-docs#1387](https://github.com/midnightntwrk/midnight-docs/issues/1387)

Official note: [Compact toolchain 0.28.0 / language 0.20.0](https://docs.midnight.network/relnotes/compact/compact-0-20-28-0). The on-chain representation of bounded unsigned integers must fit in the whole bytes of a `Field`, currently 31. `n` in `Uint<n>` is therefore at most 248. Values outside that range could fail in the proof server without a clear error. The Compact reference page still does not state this width (#1387 tracks reference gaps synced from the Compact repo). This lab note does not edit those pages.

`contracts/hello-midnight/uint-width.compact` uses only `Uint<64>` and the documented assert-then-cast form. `packages/preprod-hello-stub/src/uint-width-invariant.mjs` rejects `Uint<n>` with `n` above 248. It does not compile Compact, does not call proof-server 8.1.0, and does not claim a public deploy or a fix of the public indexer or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Also read this run: servicedesk#236 (opaque deploy when the runtime is not the matrix pin), servicedesk#225 (RPC 1010 wrapped as a generic submission error), midnight-docs#1509 (unsigned 1010 causes and code-less TransactionInvalidError), midnight-docs#1504 (Preprod Blockfrost cutoff), example-hello-world#41 (unused axios / testcontainers). None of those are fixed here.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
