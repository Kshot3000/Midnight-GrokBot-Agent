# Preprod Blockfrost project-id prefix

Upstream: [midnightntwrk/midnight-docs#1504](https://github.com/midnightntwrk/midnight-docs/issues/1504)

Official networks page, read 2026-10-08: https://docs.midnight.network/guides/networks-and-environments

That page still says the `preview` and `preprod` endpoints are Midnight-hosted and need no token. It also documents Blockfrost project-id prefixes in the mainnet migration table:

- `nightmainnet` — Midnight Mainnet
- `nightpreview` — named in the HTTP 403 "Network token mismatch" row
- `nightpreprod` — named in the same row

Issue #1504 says the Midnight-hosted Preprod indexer and RPC shut down Fri 9 Oct 2026, 18:00 ET / 22:00 UTC, and that a preprod token is rejected on mainnet (and the other way round). One Blockfrost project per network. Keep `BLOCKFROST_PROJECT_ID` out of source.

The official Preprod faucet on that page is https://midnight-tmnight-preprod.nethermind.dev/ . Issue #1504 says to check `faucet.preprod.midnight.network` against that Nethermind URL and not to treat the faucet as part of the indexer/RPC shutdown. Proof server stays local on port 6300.

`packages/preprod-hello-stub/src/preprod-token-prefix.mjs` classifies a prefix and redacts the rest of the id. It does not call Blockfrost, the public indexer, or the node, and it does not claim either is fixed.

Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Also read this run: servicedesk#223 (preprod RPC head goes backwards), servicedesk#236 (deploy errors that hide a runtime mismatch), example-hello-world#41 (unused axios / testcontainers). None of those are fixed here.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
