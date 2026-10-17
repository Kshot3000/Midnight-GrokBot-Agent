# Node.js server-side wallet: seed to synced facade (lab note)

Upstream: [midnightntwrk/midnight-docs#1380](https://github.com/midnightntwrk/midnight-docs/issues/1380)

The open issue asks for a guide that takes a Node.js process from a seed or mnemonic through a synced WalletFacade ready for deploy. Published material exists, but it is split across pages rather than one dedicated Node.js guide. This lab does not write the missing page, does not invent methods, and does not claim the public Preprod indexer or node was fixed.

Official sources (read 2026-10-17, pins Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0):

- https://docs.midnight.network/guides/acquire-tokens — "Building a wallet from a seed"
- https://docs.midnight.network/guides/deploy-mn-app — wallet creation and Preprod deploy path
- https://docs.midnight.network/sdks/official/wallet-developer-guide — HD derivation
- https://docs.midnight.network/guides/deploy-and-operate — providers for Node.js (levelPrivateStateProvider, indexerPublicDataProvider, NodeZkConfigProvider, httpClientProofProvider)

What those pages already state (copied, not invented):

1. Convert a mnemonic to a seed with a BIP-39 implementation if needed; the HD package does not do that itself. Or start from a hex seed / generateRandomSeed().
2. HDWallet.fromSeed(Buffer.from(seed, 'hex')) (or Uint8Array). Check type === 'seedOk'.
3. selectAccount(0).selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust]).deriveKeysAt(0). Check type === 'keysDerived'. Then hdWallet.clear().
4. Build ZswapSecretKeys.fromSeed, DustSecretKey, and the unshielded public key store.
5. setNetworkId('preprod') (or 'undeployed') before constructing providers. Polyfill globalThis.WebSocket in Node.js.
6. Construct ShieldedWallet, UnshieldedWallet, DustWallet, then WalletFacade. Call startWith* and wait for sync (waitForSyncedState or equivalent isSynced). Register NIGHT for DUST generation when required.
7. Persist via the private-state provider (levelPrivateStateProvider on Node, with accountId and a strong password). The same provider is used for deploy/call.
8. Once the facade is synced and funded, use it as the walletProvider / midnightProvider for midnight-js deployContract / callTx.

`packages/preprod-hello-stub/src/nodejs-wallet-seed-invariant.mjs` scans a local TypeScript snippet the caller already has for the presence of those official call names. It does not import wallet-sdk, does not connect to Preprod, and does not submit.

This note does not fix the public faucet, indexer, or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
