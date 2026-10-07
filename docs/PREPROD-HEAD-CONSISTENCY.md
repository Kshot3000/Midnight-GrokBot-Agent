# Preprod public RPC head can go backwards

Upstream: [midnightntwrk/servicedesk#223](https://github.com/midnightntwrk/servicedesk/issues/223)

On 2 Oct 2026, consecutive `chain_getHeader` calls to the public Preprod RPC returned HTTP 200 with a block number that stepped backwards (largest reported step back: 15). The same client against preview did not. Official endpoint list: https://docs.midnight.network/guides/networks-and-environments (`https://rpc.preprod.midnight.network`).

The same report also shows `system_syncState` returning `currentBlock == highestBlock` at a height below a `highestBlock` already seen seconds earlier (12:19:22 UTC: both fields at 2804284 after 2804291). That response looks synced. It is not a local reorg diagnosis, and this lab does not fix the public node or indexer.

`packages/preprod-hello-stub/src/head-consistency.mjs` compares header numbers a caller already has. `packages/preprod-hello-stub/src/sync-state-lag.mjs` compares `system_syncState` samples the same way and flags a false-synced lower head. `npm run preprod:head` posts the documented JSON-RPC method `chain_getHeader` a few times and exits 2 if the sampled head decreases. A decrease means the client saw inconsistent backends.

Related open reports read this run: [#225](https://github.com/midnightntwrk/servicedesk/issues/225) (RPC 1010 hidden by a generic submission error; already decoded in this stub), [#226](https://github.com/midnightntwrk/servicedesk/issues/226) (subset deploy), [#230](https://github.com/midnightntwrk/servicedesk/issues/230) (1AM indexer tip lag — not the public Midnight indexer), [#236](https://github.com/midnightntwrk/servicedesk/issues/236) (deploy errors that do not name a runtime mismatch).

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Local proof server, from https://docs.midnight.network/getting-started/installation :

```
docker run -p 6300:6300 midnightntwrk/proof-server:8.1.0 midnight-proof-server -v
```

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
