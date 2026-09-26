#!/usr/bin/env node
/**
 * Preprod deploy entry — HONEST gate.
 *
 * Without wallet keys → exit 2 (clear message).
 * With keys but no confirmation of funded tDUST / successful submit → NEVER claims deploy.
 *
 * Full deployContract path is scaffolded behind MIDNIGHT_PREPROD_ALLOW_SUBMIT=1
 * and still requires proof-server + funded wallet. This session does not auto-submit
 * unless those gates pass; even then success is only printed after deployTxData.
 */
import { pathToFileURL } from 'node:url';
import { loadPreprodEnv } from './load-env.mjs';
import { requireWalletOrExit, readWalletCredentials } from './require-wallet-env.mjs';
import {
  assembleProvidersWithoutWallet,
  probeProofServer,
  probeIndexer,
  probeNode,
  applyPreprodNetwork,
} from './providers.mjs';
import { PREPROD, BRAND } from './preprod-config.mjs';
import { HELLO_OUT, HELLO_CONTRACT } from './paths.mjs';
import {
  banner,
  section,
  kv,
  note,
  warn,
  brandLine,
  printJson,
  printExitLegend,
} from './cli-format.mjs';

loadPreprodEnv();

const allowSubmit = process.env.MIDNIGHT_PREPROD_ALLOW_SUBMIT === '1';

async function main() {
  banner('preprod-hello-stub · deploy gate', {
    claim: 'HONEST gate — never claims on-chain without funded tDUST + submit',
  });

  // Always fail clearly without keys (even before probes)
  requireWalletOrExit();

  applyPreprodNetwork();
  const partial = assembleProvidersWithoutWallet();
  const [proof, indexer, node] = await Promise.all([
    probeProofServer(),
    probeIndexer(),
    probeNode(),
  ]);

  section('Credentials');
  kv('allowSubmit', allowSubmit ? '1' : '0 (default honest stop)');
  section('Probes');
  kv('proof-server', proof.ok ? 'ok' : `FAIL ${proof.error || ''}`);
  kv('indexer', indexer.ok ? `ok height=${indexer.height ?? '?'}` : 'FAIL');
  kv('node', node.ok ? `ok ${node.chain || ''}`.trim() : 'FAIL');
  section('Artifacts');
  kv('helloOut', HELLO_OUT);
  kv('contract', HELLO_CONTRACT);

  printJson({
    claim: 'wallet credentials present — deploy NOT completed in this gate',
    allowSubmit,
    endpoints: partial.endpoints,
    probes: { proofServer: proof, indexer, node },
    artifacts: { helloOut: HELLO_OUT, contract: HELLO_CONTRACT },
    next: [
      'Confirm tNIGHT funded from faucet + tDUST registered (Lace or SDK)',
      'Sync WalletFacade against Preprod indexer (can take a long time)',
      'Fill walletProvider + midnightProvider, then deployContract',
      'Only claim success after deployTxData.public.contractAddress + explorer confirm',
    ],
    brand: BRAND,
  });

  if (!proof.ok) {
    warn('BLOCKED: proof-server unhealthy — refuse submit.');
    printExitLegend([3]);
    brandLine();
    console.error('\nBLOCKED: proof-server unhealthy — refuse submit.');
    console.error('  curl -sS http://127.0.0.1:6300/health');
    console.error('  npm run proof-server:podman');
    process.exit(3);
  }

  if (!indexer.ok || !node.ok) {
    console.error('\nBLOCKED: Preprod indexer/node probe failed.');
    process.exit(4);
  }

  if (!allowSubmit) {
    note('Deploy blocked pending tDUST + explicit MIDNIGHT_PREPROD_ALLOW_SUBMIT=1');
    printExitLegend([5, 6]);
    brandLine();
    console.error('\nSTOPPED (honest): credentials + infra OK, but MIDNIGHT_PREPROD_ALLOW_SUBMIT!=1.');
    console.error('Wallet sync + deployContract not auto-run — needs funded tDUST and explicit allow.');
    console.error(`Fund: ${PREPROD.faucet}`);
    console.error(`Docs: ${PREPROD.docs.deploy}`);
    process.exit(5);
  }

  // Explicit allow path — still refuse without announcing fake success.
  // Full WalletFacade + deployContract is intentionally not inlined here until
  // the funded-wallet bar is cleared on this box; keep the gate honest.
  console.error('\nBLOCKED: MIDNIGHT_PREPROD_ALLOW_SUBMIT=1 set, but funded-wallet deploy');
  console.error('harness (WalletFacade sync + deployContract) is not enabled until tDUST');
  console.error('is confirmed on this machine. Refusing to claim on-chain success.');
  console.error(`See docs/PREPROD-FUNDING.md and ${PREPROD.docs.deploy}`);
  process.exit(6);
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((e) => {
    console.error('deploy-preprod failed:', e);
    process.exit(1);
  });
}

export { main, readWalletCredentials };
