# Compact artifact packaging for consumers

Brand: donate `addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v` · [@kshot9000](https://x.com/kshot9000)

Compiled outputs are **gitignored**. Consumers regenerate locally, then load via midnight-js.

**This document does not claim a Preprod deploy.**

## Layout (after compile)

### hello-midnight

```text
contracts/hello-midnight/out/
  contract/index.js|index.d.ts|index.js.map
  compiler/contract-info.json
  keys/increment.prover
  keys/increment.verifier
  zkir/increment.zkir
  zkir/increment.bzkir
```

Compile: `npm run compact:hello` (Compact toolchain **+0.31.1**).

### agent-escrow

```text
contracts/agent-escrow/src/managed/agent-escrow/
  contract/…
  compiler/…
  keys/{initialize,fund,addMilestone,approve,reject,settle,cancel,dispute,
        resolveDisputeRefund,resolveDisputeResume,…}.{prover,verifier}
  zkir/{same}.{zkir,bzkir}
```

Compile: `npm run compact:escrow` (12 circuits).

## Inventory script

```bash
node contracts/list-compiled-artifacts.mjs
```

Prints JSON: present/missing trees, file sizes, circuit names, consumer load paths.

## How consumers prove (local proof-server)

1. Proof-server healthy: `curl -sS http://127.0.0.1:6300/health`
2. Load contract: `import(pathToFileURL(…/contract/index.js))`
3. Run impure circuit → `proofData`
4. Serialize:
   ```js
   import { proofDataIntoSerializedPreimage } from '@midnight-ntwrk/compact-runtime';
   const preimage = proofDataIntoSerializedPreimage(
     pd.input, pd.output, pd.publicTranscript, pd.privateTranscriptOutputs, circuitId
   );
   ```
5. Prove:
   ```js
   import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
   import { httpClientProvingProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
   const zk = new NodeZkConfigProvider(outRoot); // directory containing keys/ + zkir/
   const prover = httpClientProvingProvider('http://127.0.0.1:6300', zk);
   await prover.check(preimage, circuitId);
   const proof = await prover.prove(preimage, circuitId); // Uint8Array
   ```

Hello one-liner: `npm run prove:hello-local` (see `@kshot/preprod-hello-stub`).

## Wallet / Preprod gap (still real)

| Need | Local prove | On-chain deploy / call |
| --- | --- | --- |
| Compact artifacts | yes | yes |
| proof-server `:6300` | yes | yes |
| Funded wallet + tDUST | **no** | **yes** |
| `walletProvider` / `midnightProvider` | **no** | **yes** |
| `deployContract` / `proveTx` | **no** (circuit `/prove` only) | **yes** |

Faucet remains captcha-gated — no automated funding claimed.

## Pins (lab)

| Piece | Version |
| --- | --- |
| Compact toolchain | 0.31.1 |
| compact-runtime | 0.16.0 |
| midnight-js + http proof provider | 4.1.1 |
| proof-server image | 8.1.0 |
