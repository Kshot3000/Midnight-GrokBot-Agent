#!/usr/bin/env node
/**
 * Consumer-facing inventory of compiled Compact artifacts (hello + agent-escrow).
 * Artifacts are gitignored — this script documents what a successful local compile produces.
 *
 * Usage (from repo root, Node 18+):
 *   node contracts/list-compiled-artifacts.mjs
 *
 * Exit 0 even if some trees missing (prints present/missing). Exit 1 only on unexpected I/O.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '..');

const HELLO_OUT = path.join(here, 'hello-midnight/out');
const ESCROW_OUT = path.join(here, 'agent-escrow/src/managed/agent-escrow');

const BRAND = {
  donate:
    'addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  x: '@kshot9000',
};

function listDirFiles(dir, extFilter = null) {
  if (!fs.existsSync(dir)) return null;
  return fs
    .readdirSync(dir)
    .filter((n) => (extFilter ? n.endsWith(extFilter) : true))
    .sort()
    .map((n) => {
      const p = path.join(dir, n);
      const st = fs.statSync(p);
      return { name: n, bytes: st.size };
    });
}

function treeSummary(outRoot, circuitsFromKeys = true) {
  if (!fs.existsSync(outRoot)) {
    return { present: false, outRoot };
  }
  const keys = listDirFiles(path.join(outRoot, 'keys'), '.prover') || [];
  const circuits = keys.map((k) => k.name.replace(/\.prover$/, ''));
  return {
    present: true,
    outRoot: path.relative(ROOT, outRoot),
    absOutRoot: outRoot,
    contract: listDirFiles(path.join(outRoot, 'contract')),
    compiler: listDirFiles(path.join(outRoot, 'compiler')),
    keys: listDirFiles(path.join(outRoot, 'keys')),
    zkir: listDirFiles(path.join(outRoot, 'zkir')),
    circuits: circuitsFromKeys ? circuits : undefined,
    keyPairCount: keys.length,
  };
}

const report = {
  claim: 'local Compact artifact inventory — NOT a Preprod deploy',
  brand: BRAND,
  regeneratedWith: {
    hello: 'npm run compact:hello   # Compact +0.31.1 → contracts/hello-midnight/out',
    escrow: 'npm run compact:escrow  # → contracts/agent-escrow/src/managed/agent-escrow',
  },
  consumerLoadPath: {
    hello: {
      contractJs: 'contracts/hello-midnight/out/contract/index.js',
      zkConfigRoot: 'contracts/hello-midnight/out  (NodeZkConfigProvider expects keys/ + zkir/)',
      circuits: ['increment'],
      localProve: 'npm run prove:hello-local  # needs proof-server :6300',
    },
    escrow: {
      contractJs: 'contracts/agent-escrow/src/managed/agent-escrow/contract/index.js',
      zkConfigRoot: 'contracts/agent-escrow/src/managed/agent-escrow',
      circuits: [
        'initialize',
        'addMilestone',
        'fund',
        'start',
        'submitProof',
        'approve',
        'reject',
        'dispute',
        'resolveDisputeRefund',
        'resolveDisputeResume',
        'settle',
        'cancel',
      ],
      localProve: 'npm run prove:escrow-local  # initialize + synthetic localSecretKey; needs :6300',
      note: '12 impure circuits with ZK keys; pureCircuits (roleCommitment/tags) have no prover keys',
      witness: 'localSecretKey → [privateState, Uint8Array(32)]; NOT a funded wallet',
    },
  },
  gitignored: ['**/managed/', 'contracts/hello-midnight/out/', 'contracts/hello-midnight/out-zk/'],
  hello: treeSummary(HELLO_OUT),
  escrow: treeSummary(ESCROW_OUT),
};

console.log(JSON.stringify(report, null, 2));
console.log(`\nBrand · donate ${BRAND.donate}`);
console.log(`       ${BRAND.x}`);

const bothPresent = report.hello.present && report.escrow.present;
process.exit(bothPresent ? 0 : 0); // inventory always succeeds; presence is in JSON
