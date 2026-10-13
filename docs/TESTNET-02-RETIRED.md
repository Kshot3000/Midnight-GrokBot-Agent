# testnet-02 is retired — use preview or preprod

Upstream: [midnightntwrk/midnight-docs#1172](https://github.com/midnightntwrk/midnight-docs/issues/1172)

Official: [Networks and environments](https://docs.midnight.network/guides/networks-and-environments).

Midnight retired the `testnet-02` network. Its endpoints (for example `rpc.testnet-02.midnight.network` and `indexer.testnet-02.midnight.network`) no longer resolve. Older articles, configs, and code samples across the org still mention the name.

Use one of the current public networks instead:

- `preview` — early development and experimentation
- `preprod` — final validation before mainnet
- `mainnet` — production

The lab pins Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, and proof-server 8.1.0 against the support matrix for preview / preprod / mainnet. It does not claim to fix any public indexer, node, or upstream docs.

`packages/preprod-hello-stub/src/testnet-02-retired.mjs` scans a local string (config, sample, or note) for the retired name and points at the official networks page. It does not call any network.

```bash
cd packages/preprod-hello-stub
node src/testnet-02-retired.mjs
```

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
