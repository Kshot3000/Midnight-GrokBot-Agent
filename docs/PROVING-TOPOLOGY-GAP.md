# Proving topology is not yet a single guide

Upstream: [midnightntwrk/midnight-docs#1383](https://github.com/midnightntwrk/midnight-docs/issues/1383)

Official pages (checked against docs.midnight.network):

- https://docs.midnight.network/guides/local-proving
- https://docs.midnight.network/guides/run-proof-server
- https://docs.midnight.network/sdks/community/wallets/community-wallets-integration

Those pages already state the privacy rule and the Lace gap. They do not yet answer the architectural question in one place: which proving setup a builder is supposed to use, and what each one exposes.

## What the official pages say

From local-proving:

- The proof server receives witness data (private inputs). Using someone else's proof server hands secrets to a stranger.
- Run it locally, or at most on a remote machine you control, over an encrypted channel.
- Hosted proof server "defeats the purpose."
- Lace points at `http://localhost:6300` and that is currently the only proving option Lace supports.
- The proof server does not hold wallet keys, cannot sign, and cannot spend. It only builds proofs.

From the community wallets integration page (DApp Connector API v4.0.1):

- Lace requires a local proof server (Settings → Midnight → Local at `http://localhost:6300`). Lace does not expose `getProvingProvider()`, so a DApp cannot delegate proving to it.
- Some wallets implement `getProvingProvider()` and prove in-browser (WASM) or offer a hosted station.
- Feature-detect `getProvingProvider`. When it is absent (Lace), fall back to a configured local proof server. Do not hard-code the deprecated `proverServerUri`.

## Lab classifier

`packages/preprod-hello-stub/src/proving-topology.mjs` only classifies a string description of the proving setup a builder is about to use. It does not open a connection, does not call midnight-js, does not contact a proof server, and does not claim the public indexer or node is fixed.

```bash
cd packages/preprod-hello-stub
node src/proving-topology.mjs
```

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

This lab does not edit the official docs site and does not invent a new proving API.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
