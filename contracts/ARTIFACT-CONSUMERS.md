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
  keys/{initialize,fund,addMilestone,start,submitProof,approve,reject,settle,cancel,dispute,
        resolveDisputeRefund,resolveDisputeResume}.{prover,verifier}
  zkir/{same}.{zkir,bzkir}
```

Compile: `npm run compact:escrow` (**12** impure circuits with ZK keys).

Pure helpers `roleCommitment` / `clientTag` / `agentTag` / `approverTag` have **no** prover keys — they are JS-only `pureCircuits`.

## Inventory script

```bash
node contracts/list-compiled-artifacts.mjs
# or: npm run artifacts:list
```

Prints JSON: present/missing trees, file sizes, circuit names, consumer load paths.

## How consumers prove (local proof-server)

1. Proof-server healthy: `curl -sS http://127.0.0.1:6300/health`
2. Load contract: `import(pathToFileURL(…/contract/index.js))`
3. Supply witnesses (escrow: `localSecretKey` → `[privateState, Uint8Array(32)]`)
4. Run impure circuit → `proofData`
5. Serialize:
   ```js
   import { proofDataIntoSerializedPreimage } from '@midnight-ntwrk/compact-runtime';
   const preimage = proofDataIntoSerializedPreimage(
     pd.input, pd.output, pd.publicTranscript, pd.privateTranscriptOutputs, circuitId
   );
   ```
6. Prove:
   ```js
   import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
   import { httpClientProvingProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
   const zk = new NodeZkConfigProvider(outRoot); // directory containing keys/ + zkir/
   const prover = httpClientProvingProvider('http://127.0.0.1:6300', zk);
   await prover.check(preimage, circuitId);
   const proof = await prover.prove(preimage, circuitId); // Uint8Array
   ```

### One-liners

| Contract | Script | Circuit | Wallet? |
| --- | --- | --- | --- |
| hello-midnight | `npm run prove:hello-local` | `increment` | **no** |
| agent-escrow | `npm run prove:escrow-local` | `initialize` | **no** (synthetic `localSecretKey`) |

See `@kshot/preprod-hello-stub` (`src/prove-hello-local.mjs`, `src/prove-escrow-local.mjs`).

## Escrow witness requirements (exact)

| Need | `initialize` local prove | Later impure circuits (`fund`…`settle`) | On-chain deploy |
| --- | --- | --- | --- |
| Compact managed artifacts | yes | yes | yes |
| proof-server `:6300` | yes | yes | yes |
| Synthetic `localSecretKey` (32 B lab RNG) | **yes** | role-matching secrets | — |
| Role secrets that hash to registered commitments | client only | client / agent / approver per circuit | yes (app private state) |
| Funded wallet + tDUST | **no** | **no** | **yes** |
| `walletProvider` / `midnightProvider` | **no** | **no** | **yes** |
| `deployContract` / `proveTx` | **no** (circuit `/prove` only) | **no** | **yes** |

`prove:escrow-local` proves **`initialize` only** (safe CREATED→registered commitments). A full 12-circuit smoke needs persistent `sk_client` / `sk_agent` / `sk_approver` swapped into the witness between calls — documented in `ESCROW_WITNESS_REQUIREMENTS` inside `prove-escrow-local.mjs`.

Faucet remains captcha-gated — no automated funding claimed.

## Pins (lab)

| Piece | Version |
| --- | --- |
| Compact toolchain | 0.31.1 |
| compact-runtime | 0.16.0 |
| midnight-js + http proof provider | 4.1.1 |
| proof-server image | 8.1.0 |
