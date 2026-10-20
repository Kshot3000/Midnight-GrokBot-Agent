# Prover keys of 90–570 MB per circuit make client-side proving impractical

Upstream: [midnightntwrk/servicedesk#203](https://github.com/midnightntwrk/servicedesk/issues/203)

Feature request for native signature verification and related Compact improvements. Large prover keys (reported 90–570 MB per circuit) make client-side proving impractical on phones or browsers. A related measurement showed regeneration of prover keys from ZKIR is possible but still memory-heavy for high-k circuits.

This lab pins Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, proof-server 8.1.0. Prefer circuits that stay within practical key sizes for local prove paths. This note does not invent APIs, does not patch the compiler, and does not claim a fix of the public proof server, indexer, or node.

Official references:

- https://docs.midnight.network/guides/local-proving
- https://docs.midnight.network/relnotes/support-matrix
- https://docs.midnight.network/api-reference/error-reference/proof-server-errors

The companion classifier lives in `packages/preprod-hello-stub/src/prover-key-size-gap.mjs`. It only classifies a reported size string; it never generates keys or contacts a proof server.

```bash
cd packages/preprod-hello-stub
node src/prover-key-size-gap.mjs
```

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
