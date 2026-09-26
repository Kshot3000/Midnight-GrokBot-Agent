# @kshot/preprod-hello-stub

Thin **honest** stub on the Compact → Preprod path for Midnight GrokBot Agent.

Brand: donate `addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v` · [@kshot9000](https://x.com/kshot9000)

## What this is

- Loads **real** `contracts/hello-midnight/out` artifacts from `compact compile +0.31.1`
- Pins `@midnight-ntwrk/compact-runtime@0.16.0` (compiler-enforced) + `@midnight-ntwrk/midnight-js@4.1.1`
- Runs **off-chain** `increment` via the generated `Contract` class
- Prints official Preprod endpoints / `setNetworkId('preprod')` — **config only**

## What this is NOT

- Not a Preprod deploy
- Not a faucet / wallet funder
- Not a substitute for a local proof-server when submitting txs

## Prerequisites

1. Node **22+** (box: `fnm` → `fnm use 22`; system `/usr/bin/node` may stay on 20)
2. Compact artifacts:
   ```bash
   export PATH="$HOME/.local/bin:$PATH"
   npm run compact:hello
   ```

## Commands

```bash
# from repo root, with Node 22 active
npm install -w @kshot/preprod-hello-stub
npm run check:artifacts -w @kshot/preprod-hello-stub
npm run offchain -w @kshot/preprod-hello-stub
npm run preprod:config -w @kshot/preprod-hello-stub
npm test -w @kshot/preprod-hello-stub
```

## Proof-server (local)

```bash
podman run --rm -p 6300:6300 docker.io/midnightntwrk/proof-server:8.1.0 midnight-proof-server -v
# or: docker run --rm -p 6300:6300 midnightntwrk/proof-server:8.1.0 midnight-proof-server -v
```

Lace Local → `http://localhost:6300`. Proof server sees witness data in the clear — keep it local.

## Next real bar (not claimed here)

1. Proof-server healthy on `:6300`
2. Funded Preprod wallet + DUST registration
3. `deployContract` from `@midnight-ntwrk/midnight-js-contracts` with providers

See `docs/COMPACT-PREPROD-PATH-2026-09-26.md`.
