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
import { PREPROD, BRAND } from './preprod-config.mjs';

const assembled = assembleProvidersWithoutWallet();
const [proof, indexer, node] = await Promise.all([
  probeProofServer(),
  probeIndexer(),
  probeNode(),
]);

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
  brand: BRAND,
};

console.log(JSON.stringify(report, null, 2));

if (!proof.ok) {
  console.error('\nWARN: proof-server not healthy on :6300 — start with: npm run proof-server:podman');
  process.exitCode = 0; // wiring still succeeded; health is advisory here
}
