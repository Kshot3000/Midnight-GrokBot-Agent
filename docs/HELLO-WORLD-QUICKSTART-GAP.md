# Hello World quick start still stops at the local test script

Upstream: [midnightntwrk/midnight-docs#1396](https://github.com/midnightntwrk/midnight-docs/issues/1396)

The issue asks to sunset Midnight Academy links and make Hello World the main quick start: deploy and call from TypeScript, read state back, a witness step, Preprod, and troubleshooting. The published getting-started page has not done that.

Official sample (copied, not invented): https://docs.midnight.network/getting-started/hello-world

- `pragma language_version 0.23;`
- `export ledger message: Opaque<"string">;`
- `storeMessage` assigns `disclose(newMessage)`. Circuit arguments are private. Without `disclose()`, the public write is a compiler error.
- The page ends at `yarn test:local` on the Docker devnet. The log shows deploy and `Stores Hello World!`. It does not show a witness, a ledger read, or Preprod.

A separate guide already covers Preprod for the same example repo: https://docs.midnight.network/guides/deploy-mn-app (`yarn proof:up`, then `yarn test:preprod`). That path is not on the getting-started page #1396 calls out.

Academy material is still published on the docs site, for example https://docs.midnight.network/academy/module-3. This lab note does not edit midnight-docs and does not claim those links were removed.

Lab copy: `contracts/hello-midnight/hello-tutorial-gap.compact`

- Exact tutorial circuit only. No witness and no getter circuit (public ledger reads are off-chain; witnesses belong to the election and bulletin-board examples).
- `packages/preprod-hello-stub/src/hello-tutorial-gap.mjs` checks the source. It does not compile Compact, call proof-server 8.1.0, or deploy.

Pins: Compact ~0.31.1 / language 0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This lab note does not fix the public indexer or node.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
