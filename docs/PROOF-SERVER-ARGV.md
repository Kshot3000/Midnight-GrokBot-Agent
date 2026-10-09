# Proof-server Docker argv pin

Upstream open: [midnightntwrk/example-hello-world#13](https://github.com/midnightntwrk/example-hello-world/issues/13)

The hello-world compose file pins `midnightntwrk/proof-server` at 8.1.0. Renovate on that issue lists 8.1.3 as an available tag. This lab does not bump. Public proving for the current networks stays on proof-server 8.1.0, matching the Windows Compact setup page.

Official samples disagree on the image tag and on Docker's end-of-flags marker:

- Windows Compact setup: `docker run -p 6300:6300 midnightntwrk/proof-server:8.1.0 -- midnight-proof-server -v`
- Getting started still shows `midnightntwrk/proof-server:8.0.3` and no `--`. Closed [midnight-docs#556](https://github.com/midnightntwrk/midnight-docs/issues/556) already reported that install page as outdated.

`packages/preprod-hello-stub/src/proof-server-argv.mjs` accepts both argv shapes when the image is `midnightntwrk/proof-server:8.1.0`, and rejects 8.0.3, 8.1.3, and `latest`. The `--` is Docker's end-of-flags separator; it is not a proof-server flag. This helper does not run Docker and does not claim a fix of the public indexer, node, or proof server.

Official:

- https://docs.midnight.network/guides/windows-compact-setup
- https://docs.midnight.network/getting-started/installation

Also read this run, not fixed here: servicedesk#236 (opaque deploy when compact-runtime differs from midnight-js 4.1.1), servicedesk#225 (RPC 1010 wrapped as a generic submission error), midnight-docs#1509 (1010 without an inner u8, and code-less TransactionInvalidError), midnight-docs#1504 (Preprod indexer and RPC move to Blockfrost), example-hello-world#41 (unused axios and testcontainers).

Pins used by this lab: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
