# Node seed-to-deploy guide is still missing

Upstream: [midnightntwrk/midnight-docs#1380](https://github.com/midnightntwrk/midnight-docs/issues/1380)

Issue #1380 asks for a Node.js server-side guide that goes from a seed, to a synced wallet, to a contract deploy. That page is not in the docs index.

What is published:

- Hello World deploys with `yarn test:local` against a local devnet that already has pre-funded wallets. It does not take a seed. https://docs.midnight.network/getting-started/hello-world
- The unshielded-token tutorial does take `MIDNIGHT_SEED` and waits until that address holds NIGHT. That is a token script, not the deploy guide #1380 asks for. https://docs.midnight.network/tokens/unshielded-token

This lab does not invent a `WalletBuilder` or `FluentWalletBuilder` call. It does not sync a wallet, deploy a contract, or fix the public indexer or node.

`packages/preprod-hello-stub/src/node-seed-deploy-gap.mjs` records that split and rejects a public throwaway payload that carries a mnemonic or seed. The generator still writes secrets only under gitignored `.secrets/`.

Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
