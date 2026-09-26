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
| agent-escrow | `npm run prove:escrow-local` (default path=happy) | multi-circuit lifecycle | **no** (synthetic role secrets) |
| agent-escrow | `npm run prove:escrow-all` | all 12 impure via named paths | **no** |

See `@kshot/preprod-hello-stub` (`src/prove-hello-local.mjs`, `src/prove-escrow-local.mjs`).

## Escrow witness requirements (exact)

| Need | Local multi-circuit prove | On-chain deploy |
| --- | --- | --- |
| Compact managed artifacts | yes | yes |
| proof-server `:6300` | yes | yes |
| Synthetic `sk_client` / `sk_agent` / `sk_approver` (32 B lab RNG) | **yes** (role swap via `privateState.activeRole`) | — |
| Role secrets that hash to registered commitments | yes (lab-generated) | yes (app private state) |
| Real Zswap / Coin receive | **no** (`fund` is ledger `Uint` in this skeleton) | optional / future |
| Funded wallet + tDUST | **no** | **yes** |
| `walletProvider` / `midnightProvider` | **no** | **yes** |
| `deployContract` / `proveTx` | **no** (circuit `/prove` only) | **yes** |

`prove:escrow-local` default path **`happy`** proves 7 lifecycle circuits with synthetic role secrets.
`prove:escrow-all` covers **all 12** impure circuits across named paths (`happy` / `reject` / `dispute-*` / `cancel`).
**Blocked for local prove: none.** On-chain still needs faucet/tDUST.

Faucet remains captcha-gated — no automated funding claimed.

## Pins (lab)

| Piece | Version |
| --- | --- |
| Compact toolchain | 0.31.1 |
| compact-runtime | 0.16.0 |
| midnight-js + http proof provider | 4.1.1 |
| proof-server image | 8.1.0 |
