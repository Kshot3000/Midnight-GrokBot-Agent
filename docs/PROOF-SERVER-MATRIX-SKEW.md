# Proof-server matrix tag does not match the prove guide

Upstream open: [midnightntwrk/midnight-docs#1494](https://github.com/midnightntwrk/midnight-docs/issues/1494)

The support-matrix JSON fields for the proof server do not resolve. The issue says `github` points at `midnightntwrk/midnight-node`, `container` points at `docker.io/midnightntwrk/midnight-node-toolkit`, and the git tag `proof-server-8.1.0` does not exist. It says the release lives on midnight-ledger as `proof-server-8.1.3`, and the image is `midnightntwrk/proof-server`.

The published matrix page (https://docs.midnight.network/relnotes/support-matrix) lists Proof server 8.1.3 for Preview, Preprod, and Mainnet. The local-proving page (https://docs.midnight.network/guides/local-proving) and the installation page still start:

```text
docker run -p 6300:6300 midnightntwrk/proof-server:8.1.0 midnight-proof-server -v
```

Those are different strings. This lab pin follows the prove guide image `midnightntwrk/proof-server:8.1.0`. It does not invent a git tag, and it does not treat 8.1.3 as a drop-in replacement for that command.

`packages/preprod-hello-stub/src/proof-server-matrix-skew.mjs` labels a command or matrix row the caller already pasted. It accepts the prove-guide image, notes when the page version 8.1.3 is present, and rejects the toolkit container and a midnight-node github field. It does not pull images, does not dial port 6300, and does not claim a fix of the public indexer, node, or proof server.

Also read this run, not fixed here: servicedesk#236 (opaque deploy when compact-runtime differs from midnight-js 4.1.1), servicedesk#225 (RPC 1010 wrapped as a generic submission error), midnight-docs#1509 (1010 without an inner u8, and code-less TransactionInvalidError), example-hello-world#41 (unused axios and testcontainers).

Pins used by this lab: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
