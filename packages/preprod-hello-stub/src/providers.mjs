/**
 * Midnight.js provider wiring for Preprod hello deploy path.
 *
 * Assembles the six required provider slots from official packages (4.1.1).
 * Wallet / midnight provider slots require a synced WalletFacade — this module
 * builds the NON-wallet providers always, and documents the wallet slot shape.
 *
 * Calling assembleProvidersWithoutWallet() does NOT deploy.
 * Calling tryAssembleFullProviders() exits clearly if keys / proof-server missing.
 */
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { WebSocket } from 'ws';

import { PREPROD } from './preprod-config.mjs';
import { HELLO_OUT } from './paths.mjs';
import './check-artifacts.mjs';

/** Circuit names for hello-midnight (increment). */
export const HELLO_CIRCUITS = /** @type {const} */ (['increment']);

/**
 * Apply Preprod network id + Node WebSocket polyfill (wallet SDK indexer).
 * Must run before any address / tx construction.
 */
export function applyPreprodNetwork() {
  setNetworkId(PREPROD.networkId);
  if (!globalThis.WebSocket) {
    globalThis.WebSocket = WebSocket;
  }
  return PREPROD.networkId;
}

/**
 * Build indexer / zk / proof / (optional) private-state providers.
 * Does not create walletProvider / midnightProvider — those need a funded wallet.
 *
 * @param {{ accountId?: string, privateStatePassword?: string }} [opts]
 */
export function assembleProvidersWithoutWallet(opts = {}) {
  applyPreprodNetwork();

  const zkConfigProvider = new NodeZkConfigProvider(HELLO_OUT);
  const publicDataProvider = indexerPublicDataProvider(PREPROD.indexer, PREPROD.indexerWS);
  const proofProvider = httpClientProofProvider(PREPROD.proofServer, zkConfigProvider);

  /** @type {Record<string, unknown>} */
  const partial = {
    publicDataProvider,
    zkConfigProvider,
    proofProvider,
    // intentional holes — filled only with wallet:
    walletProvider: null,
    midnightProvider: null,
    privateStateProvider: null,
  };

  if (opts.accountId) {
    const password =
      opts.privateStatePassword ||
      process.env.PRIVATE_STATE_PASSWORD ||
      'Preprod-Lab-Placeholder-16chars';
    partial.privateStateProvider = levelPrivateStateProvider({
      privateStateStoreName: 'hello-midnight-private-state',
      signingKeyStoreName: 'hello-midnight-signing-keys',
      privateStoragePasswordProvider: () => password,
      accountId: opts.accountId,
    });
  }

  return {
    claim: 'partial providers — wallet slots null until funded seed + WalletFacade',
    networkId: PREPROD.networkId,
    endpoints: {
      indexer: PREPROD.indexer,
      indexerWS: PREPROD.indexerWS,
      node: PREPROD.node,
      nodeWS: PREPROD.nodeWS,
      proofServer: PREPROD.proofServer,
    },
    helloOut: HELLO_OUT,
    circuits: HELLO_CIRCUITS,
    providers: partial,
    missingForDeploy: [
      'walletProvider (WalletFacade balanceTx + keys)',
      'midnightProvider (same instance submitTx)',
      opts.accountId ? null : 'privateStateProvider (needs accountId = unshielded bech32)',
      'funded tNIGHT + registered tDUST',
      'proof-server healthy on :6300',
    ].filter(Boolean),
  };
}

/**
 * Probe proof-server health. Returns { ok, status, body }.
 */
export async function probeProofServer(url = PREPROD.proofServer) {
  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/health`, { signal: AbortSignal.timeout(5000) });
    const body = await res.text();
    return { ok: res.ok, status: res.status, body: body.slice(0, 200) };
  } catch (e) {
    return { ok: false, status: 0, body: String(e?.message || e) };
  }
}

/**
 * Probe Preprod indexer block height.
 */
export async function probeIndexer(url = PREPROD.indexer) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ block { height } }' }),
      signal: AbortSignal.timeout(10000),
    });
    const json = await res.json();
    const height = json?.data?.block?.height;
    return { ok: typeof height === 'number' && height > 0, height, raw: json };
  } catch (e) {
    return { ok: false, height: null, error: String(e?.message || e) };
  }
}

/**
 * Probe Preprod node chain identity.
 */
export async function probeNode(url = PREPROD.node) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'system_chain', params: [], id: 1 }),
      signal: AbortSignal.timeout(10000),
    });
    const json = await res.json();
    return { ok: json?.result === 'Midnight Preprod', chain: json?.result ?? null };
  } catch (e) {
    return { ok: false, chain: null, error: String(e?.message || e) };
  }
}
