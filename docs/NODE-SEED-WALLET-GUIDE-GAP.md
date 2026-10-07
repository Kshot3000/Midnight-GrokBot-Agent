# Node seed-to-deploy guide is still missing

Upstream: [midnightntwrk/midnight-docs#1380](https://github.com/midnightntwrk/midnight-docs/issues/1380)

Official pages this lab follows (read 2026-10-07). They are not a single Node deploy guide:

- https://docs.midnight.network/guides/acquire-tokens (section "Building a wallet from a seed")
- https://docs.midnight.network/guides/generating-dust-programmatically
- https://docs.midnight.network/tutorials/beginner/counter/counter-cli
- https://docs.midnight.network/guides/local-proving (proof server `midnightntwrk/proof-server:8.1.0` on port 6300)

Issue #1380 says there is no guide that takes a Node.js process from a seed to a synced wallet to a contract deploy. Kapa search traffic asks for `buildWallet`, `initWalletWithSeed`, `waitForSync`, and `registerNightForDust` by filename. This lab does not invent those names. The pages above use `setNetworkId`, `ZswapSecretKeys.fromSeed`, `DustSecretKey.fromSeed`, `WalletFacade`, `state().isSynced`, `waitForSyncedState`, `registerNightUtxosForDustGeneration`, `estimateRegistration`, `waitForGeneratedDust`, `finalizeRecipe`, and `submitTransaction`.

A deploy script in this lab should:

1. Call `setNetworkId` before constructing wallets. Preview, preprod, and undeployed are different network ids.
2. Wait until `isSynced` or `waitForSyncedState` before registration. The acquire-tokens page says registration needs a fully synced wallet and that a restarted script syncs again from the beginning.
3. Register unshielded NIGHT for DUST before a proving deploy. The counter CLI uses `registerNightUtxosForDustGeneration`, then `finalizeRecipe`, then `submitTransaction`.
4. Point proving at a local proof server (`http://localhost:6300`, image tag 8.1.0). Lace only accepts that host port for a local proof server.
5. Keep seeds and `BLOCKFROST_PROJECT_ID` out of source. A 64-hex literal in a script is a secret, not a fixture.

This does not fix the public indexer or node. Hosted preprod RPC and indexer shutdown is tracked separately in midnight-docs#1504. Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

`packages/preprod-hello-stub/src/node-seed-wallet-gap.mjs` classifies a script the builder already has. It does not start a wallet.

Also read this run: servicedesk#223 (preprod head goes backwards), servicedesk#236 (deploy errors that hide a runtime mismatch), example-hello-world#41 (unused axios and testcontainers). None of those are fixed here.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
