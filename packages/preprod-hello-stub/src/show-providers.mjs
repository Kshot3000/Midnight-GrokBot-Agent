#!/usr/bin/env node
/**
 * Print Preprod provider wiring + live probes. NOT a deploy.
 */
import {
  assembleProvidersWithoutWallet,
  probeProofServer,
  probeIndexer,
  probeNode,
} from './providers.mjs';
import { PREPROD } from './preprod-config.mjs';
import {
  banner,
  section,
  kv,
  ok,
  warn,
  note,
  brandLine,
  printJson,
} from './cli-format.mjs';

banner('preprod-hello-stub · providers', {
  claim: 'wiring + probes — NOT a Preprod deploy',
});

const assembled = assembleProvidersWithoutWallet();
const [proof, indexer, node] = await Promise.all([
  probeProofServer(),
  probeIndexer(),
  probeNode(),
]);

section('Wiring');
kv('networkId', assembled.networkId);
kv('circuits', (assembled.circuits || []).join(', ') || '(none)');
kv('helloOut', assembled.helloOut);
kv('provider keys', Object.keys(assembled.providers).sort().join(', '));
kv('wallet slots', assembled.providers.walletProvider ? 'filled' : 'null (need funded wallet)');
kv('missing', assembled.missingForDeploy.join(', ') || '(none)');

section('Live probes');
kv('proof-server', proof.ok ? `ok · ${proof.detail || proof.url || PREPROD.proofServer}` : `FAIL · ${proof.error || proof.detail || 'unreachable'}`);
kv('indexer', indexer.ok ? `ok · height ${indexer.height ?? '?'}` : `FAIL · ${indexer.error || 'unreachable'}`);
kv('node', node.ok ? `ok · ${node.chain || node.detail || 'Midnight Preprod'}` : `FAIL · ${node.error || 'unreachable'}`);

if (proof.ok) ok('proof-server healthy (local)');
else warn('proof-server not healthy on :6300 — start with: npm run proof-server:podman');

note('Deploy blocked until tDUST > 0 after faucet (captcha) + DUST registration.');

const report = {
  claim: 'providers wiring + probes — NOT a Preprod deploy',
  networkId: assembled.networkId,
  endpoints: assembled.endpoints,
  faucet: PREPROD.faucet,
  faucetAlt: PREPROD.faucetAlt,
  circuits: assembled.circuits,
  helloOut: assembled.helloOut,
  providerKeysPresent: Object.keys(assembled.providers).sort(),
  walletSlotsFilled: Boolean(
    assembled.providers.walletProvider && assembled.providers.midnightProvider,
  ),
  missingForDeploy: assembled.missingForDeploy,
  probes: {
    proofServer: proof,
    indexer,
    node,
  },
};
printJson(report);
brandLine();

if (!proof.ok) {
  process.exitCode = 0; // wiring still succeeded; health is advisory here
}
