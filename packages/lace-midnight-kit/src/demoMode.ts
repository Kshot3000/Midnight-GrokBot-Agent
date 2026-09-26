/**
 * Simulated session for UI polish when Lace is not installed.
 * Always label as SIMULATED in the consuming UI — never claim a real wallet.
 */

import type { ConnectedAPI, Configuration, ConnectionStatus, InitialAPI } from '@midnight-ntwrk/dapp-connector-api';

import type { ConnectedSession } from './connect.js';
import type { DiscoveredProvider } from './discover.js';
import { MidnightNetworkIds } from './networks.js';
import type { CapabilityProbe } from './capabilities.js';

export const DEMO_MODE_LABEL = 'SIMULATED · no Lace';

const DEMO_RDNS = 'io.kshot.midnight-lab.demo';

function demoInitialApi(): InitialAPI {
  return {
    apiVersion: '4.0.1',
    name: 'Midnight Lab Demo Wallet',
    rdns: DEMO_RDNS,
    icon: '',
    connect: async () => {
      throw new Error('Demo InitialAPI.connect should not be called — use createDemoSession().');
    },
  } as InitialAPI;
}

/**
 * Build a fake ConnectedSession for screenshots / UX review without Lace.
 * Addresses are clearly lab-prefixed placeholders.
 */
export function createDemoSession(
  networkId: string = MidnightNetworkIds.Preprod,
): ConnectedSession {
  const provider: DiscoveredProvider = {
    injectionKey: 'demo-simulated-key',
    api: demoInitialApi(),
  };

  const status: ConnectionStatus = {
    status: 'connected',
    networkId,
  } as ConnectionStatus;

  const configuration = {
    indexerUri: 'https://example.invalid/indexer (simulated)',
    proverServerUri: 'https://example.invalid/prover (simulated)',
  } as unknown as Configuration;

  const api = {
    getConnectionStatus: async () => status,
    getUnshieldedAddress: async () => ({
      unshieldedAddress: `mn_addr_unshielded_SIM_${networkId}_lab_demo_only`,
    }),
    getShieldedAddresses: async () => ({
      shieldedAddress: `mn_addr_shielded_SIM_${networkId}_lab_demo_only`,
    }),
    getDustAddress: async () => ({
      dustAddress: `mn_addr_dust_SIM_${networkId}_lab_demo_only`,
    }),
    getConfiguration: async () => configuration,
  } as unknown as ConnectedAPI;

  return {
    provider,
    api,
    networkId,
    status,
    configuration,
    addresses: {
      unshieldedAddress: `mn_addr_unshielded_SIM_${networkId}_lab_demo_only`,
      shieldedAddress: `mn_addr_shielded_SIM_${networkId}_lab_demo_only`,
      dustAddress: `mn_addr_dust_SIM_${networkId}_lab_demo_only`,
    },
  };
}

/** Capability probe rows for demo mode (all ok except transfer skipped). */
export function createDemoCapabilityProbe(): CapabilityProbe {
  return {
    generatedAt: new Date().toISOString(),
    okCount: 5,
    scopeNote:
      'SIMULATED probe — Lace is not connected. makeTransfer is never called in demo mode either.',
    rows: [
      { id: 'status', label: 'Connection status', method: 'getConnectionStatus', status: 'ok', detail: 'Simulated ok' },
      { id: 'unshielded', label: 'Unshielded address', method: 'getUnshieldedAddress', status: 'ok', detail: 'Simulated ok' },
      { id: 'shielded', label: 'Shielded address', method: 'getShieldedAddresses', status: 'ok', detail: 'Simulated ok' },
      { id: 'dust', label: 'Dust address', method: 'getDustAddress', status: 'ok', detail: 'Simulated ok' },
      { id: 'config', label: 'Configuration', method: 'getConfiguration', status: 'ok', detail: 'Simulated ok' },
      {
        id: 'transfer',
        label: 'Transfers',
        method: 'makeTransfer',
        status: 'skipped',
        detail: 'Not probed — discovery + connect scope only.',
      },
    ],
  };
}

export function isDemoSession(session: ConnectedSession | null): boolean {
  return Boolean(session && session.provider.injectionKey === 'demo-simulated-key');
}
