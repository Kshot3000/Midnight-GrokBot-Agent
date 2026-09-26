/**
 * Post-connect session health — re-check getConnectionStatus.
 * Does not call makeTransfer / submit.
 */

import type { ConnectedAPI, ConnectionStatus } from '@midnight-ntwrk/dapp-connector-api';

import { normalizeConnectorError } from './errors.js';

export type SessionHealth = {
  alive: boolean;
  status: ConnectionStatus | null;
  checkedAt: string;
  detail: string;
};

/** Read connection status and map to a simple alive flag. */
export async function checkSessionHealth(api: ConnectedAPI): Promise<SessionHealth> {
  const checkedAt = new Date().toISOString();
  try {
    const status = await api.getConnectionStatus();
    if (status.status === 'connected') {
      return {
        alive: true,
        status,
        checkedAt,
        detail: `connected · networkId=${status.networkId}`,
      };
    }
    return {
      alive: false,
      status,
      checkedAt,
      detail: 'Wallet reported disconnected',
    };
  } catch (err) {
    const e = normalizeConnectorError(err);
    return {
      alive: false,
      status: null,
      checkedAt,
      detail: `[${e.code}] ${e.message}`,
    };
  }
}

export async function isSessionAlive(api: ConnectedAPI): Promise<boolean> {
  const health = await checkSessionHealth(api);
  return health.alive;
}
