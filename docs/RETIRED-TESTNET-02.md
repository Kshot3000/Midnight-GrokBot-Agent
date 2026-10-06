# Retired testnet-02 endpoints

Upstream: [midnightntwrk/midnight-docs#1172](https://github.com/midnightntwrk/midnight-docs/issues/1172).

Official docs say the `testnet-02` name is retired. `rpc.testnet-02.midnight.network` and `indexer.testnet-02.midnight.network` no longer resolve. Use `preview` or `preprod` from the environment reference:

https://docs.midnight.network/guides/networks-and-environments

| Network | Node RPC | Indexer |
| --- | --- | --- |
| preview | `https://rpc.preview.midnight.network` | `https://indexer.preview.midnight.network/api/v4/graphql` |
| preprod | `https://rpc.preprod.midnight.network` | `https://indexer.preprod.midnight.network/api/v4/graphql` |

An `ENOTFOUND` on `testnet-02` is that retirement, not a Preprod indexer or node outage. This lab does not restore the hostname and does not change the public indexer or node.

`packages/preprod-hello-stub/src/retired-testnet.mjs` classifies those hostnames and `loadPreprodEnv()` refuses them in `MIDNIGHT_NODE_URL`, `MIDNIGHT_NODE_WS_URL`, `MIDNIGHT_INDEXER_URL`, `MIDNIGHT_INDEXER_WS_URL`, and `MIDNIGHT_FAUCET_URL`.

Also read this run: open servicedesk issues (including #223 and #236, already covered here), open midnight-docs issues, and example-hello-world #41 (unused axios/testcontainers, already covered). No push to those orgs.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
