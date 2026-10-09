# Prove-path: keys and circuit out of sync

Upstream: [midnightntwrk/midnight-docs#1377](https://github.com/midnightntwrk/midnight-docs/issues/1377)

The Kapa review lists proof-server errors as a large pasted-error cluster. The official local-proving page already names one prove-path failure that is not "port 6300 refused" and not a node rejection.

Official page, read 2026-10-09: https://docs.midnight.network/guides/local-proving

Documented text, not invented:

- The prover verifies its own proof before returning it.
- If keys and circuit do not match, the error says `check that your keys match` rather than failing silently at submission.
- In practice this almost always means stale build artifacts.
- Documented solution: recompile the smart contract.
- Proof-server pin on that page: `midnightntwrk/proof-server:8.1.0`.

This lab classifier only labels a string the caller already has. It does not dial port 6300, does not recompile, and does not claim the public proof server, indexer, or node is fixed.

`ECONNREFUSED 127.0.0.1:6300`, a Compact `failed assert`, and a `1010` submission string stay in their own kinds.

Lab pin stays Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Classifier: `packages/preprod-hello-stub/src/prove-key-mismatch.mjs`

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
