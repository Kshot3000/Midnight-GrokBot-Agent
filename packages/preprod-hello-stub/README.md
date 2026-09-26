# @kshot/preprod-hello-stub

Thin **honest** Preprod path for Midnight GrokBot Agent — Compact artifacts, midnight-js **4.1.1** providers wiring, clear-fail deploy gate.

Brand: donate `addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v` · [@kshot9000](https://x.com/kshot9000)

## What this is

- Loads **real** `contracts/hello-midnight/out` artifacts from `compact compile +0.31.1`
- Pins compact-runtime **0.16.0** + midnight-js **4.1.1** (+ provider packages)
- Off-chain `increment` via generated `Contract`
- Preprod endpoints / `setNetworkId('preprod')` + **providers assembly** (indexer / zk / proof)
- Scripts that **exit non-zero** without wallet keys (no pretend deploy)
- Throwaway wallet generator (secrets → `.secrets/`, never commit)

## What this is NOT

- Not a confirmed Preprod on-chain deploy
- Not a captcha-free faucet (browser required)
- Not a substitute for local proof-server on `:6300`

## Commands (Node 22+)

```bash
export PATH="$HOME/.local/share/fnm:$PATH"
eval "$(fnm env)" && fnm use 22

npm run check:artifacts -w @kshot/preprod-hello-stub
npm run offchain -w @kshot/preprod-hello-stub
npm run preprod:config -w @kshot/preprod-hello-stub
npm run preprod:providers -w @kshot/preprod-hello-stub
npm run preprod:require-wallet -w @kshot/preprod-hello-stub   # exits 2 without keys
npm run wallet:gen -w @kshot/preprod-hello-stub
npm run faucet:attempt -w @kshot/preprod-hello-stub            # fails without captcha
npm run preprod:deploy -w @kshot/preprod-hello-stub            # clear gates
npm test -w @kshot/preprod-hello-stub
```

Root aliases: `stub:check`, `stub:offchain`, `stub:preprod-config`, `stub:providers`, `stub:require-wallet`, `stub:wallet-gen`, `stub:faucet-attempt`, `stub:deploy-preprod`, `stub:test`.

## Env

```bash
cp .env.preprod.example .env.preprod   # from repo root
# set MIDNIGHT_WALLET_MNEMONIC or MIDNIGHT_WALLET_SEED (one only)
```

See `docs/PREPROD-FUNDING.md`.

## Proof-server

Reuse healthy local server:

```bash
curl -sS http://127.0.0.1:6300/health
# or: npm run proof-server:podman
```
