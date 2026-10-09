# Local prove path does not grow Confidential Space flags

Upstream open: [midnightntwrk/servicedesk#204](https://github.com/midnightntwrk/servicedesk/issues/204)

That issue is a review request for midnight-ledger#765 (proof server GCP Confidential Space support). It is still open and untriaged. The public proof-server pages do not document a Confidential Space, TEE, or GCP flag.

Documented local start (https://docs.midnight.network/guides/local-proving):

```text
docker run -p 6300:6300 midnightntwrk/proof-server:8.1.0 midnight-proof-server -v
```

Also named there, and on https://docs.midnight.network/guides/run-proof-server:

- default listen port 6300
- `--port` and `MIDNIGHT_PROOF_SERVER_PORT`
- `--no-fetch-params` and `MIDNIGHT_PARAM_SOURCE`
- `--num-workers` (proving workers, not the HTTP worker count in the startup log)
- image `midnightntwrk/proof-server`, tag from the compatibility matrix (8.1.0). Do not rely on `latest`.

`packages/preprod-hello-stub/src/confidential-space-argv.mjs` accepts that documented command and rejects Confidential Space / TEE tokens and the toolkit image. It does not run Docker, does not contact a proof server, and does not claim a fix of the public indexer, node, or proof server.

Also read this run, not fixed here: servicedesk#236 (opaque deploy when compact-runtime differs from midnight-js 4.1.1; ContractMaintenanceAuthority still unnamed), servicedesk#225 (RPC 1010 wrapped as a generic submission error), midnight-docs#1509 (1010 without an inner u8, and code-less TransactionInvalidError), midnight-docs#1494 (support-matrix JSON tags that do not resolve), example-hello-world#41 (unused axios and testcontainers).

Pins used by this lab: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
