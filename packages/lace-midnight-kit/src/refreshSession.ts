/**
 * Re-read live session data from an existing ConnectedAPI handle.
 * Does not call makeTransfer / submit.
 */

import type { Configuration, ConnectionStatus } from '@midnight-ntwrk/dapp-connector-api';
import type { ConnectedSession } from './connect.js';
import { KitErrorCodes, LaceMidnightKitError, normalizeConnectorError } from './errors.js';
import { isDemoSession } from './demoMode.js';

export type BalanceSnapshot = {
  unshielded: Record<string, string> | null;
  shielded: Record<string, string> | null;
  dust: { balance: string; cap: string } | null;
  errors: string[];
};

export type RefreshedSession = ConnectedSession & {
  refreshedAt: string;
  balances: BalanceSnapshot;
};

function bigintRecordToStrings(
  rec: Record<string, bigint>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(rec)) {
    out[k] = v.toString();
  }
  return out;
}

async function readAddresses(
  api: ConnectedSession['api'],
): Promise<ConnectedSession['addresses']> {
  const addresses: ConnectedSession['addresses'] = {
    unshieldedAddress: null,
    shieldedAddress: null,
    dustAddress: null,
  };
  try {
    const u = await api.getUnshieldedAddress();
    addresses.unshieldedAddress = u.unshieldedAddress;
  } catch {
    /* leave null */
  }
  try {
    const s = await api.getShieldedAddresses();
    addresses.shieldedAddress = s.shieldedAddress;
  } catch {
    /* leave null */
  }
  try {
    const d = await api.getDustAddress();
    addresses.dustAddress = d.dustAddress;
  } catch {
    /* leave null */
  }
  return addresses;
}

/**
 * Probe balances (read-only). Failures are collected; never throws for a single miss.
 */
export async function readBalancesSafely(
  api: ConnectedSession['api'],
): Promise<BalanceSnapshot> {
  const errors: string[] = [];
  let unshielded: Record<string, string> | null = null;
  let shielded: Record<string, string> | null = null;
  let dust: { balance: string; cap: string } | null = null;

  try {
    const u = await api.getUnshieldedBalances();
    unshielded = bigintRecordToStrings(u as Record<string, bigint>);
  } catch (err) {
    errors.push(`unshielded: ${normalizeConnectorError(err).message}`);
  }
  try {
    const s = await api.getShieldedBalances();
    shielded = bigintRecordToStrings(s as Record<string, bigint>);
  } catch (err) {
    errors.push(`shielded: ${normalizeConnectorError(err).message}`);
  }
  try {
    const d = await api.getDustBalance();
    dust = { balance: d.balance.toString(), cap: d.cap.toString() };
  } catch (err) {
    errors.push(`dust: ${normalizeConnectorError(err).message}`);
  }

  return { unshielded, shielded, dust, errors };
}

/**
 * Refresh status, configuration, addresses, and optional balances on a live session.
 */
export async function refreshConnectedSession(
  session: ConnectedSession,
  options: { includeBalances?: boolean } = {},
): Promise<RefreshedSession> {
  if (isDemoSession(session)) {
    throw new LaceMidnightKitError(
      KitErrorCodes.Unknown,
      'Cannot refresh a simulated demo session against a live wallet.',
      { recoverable: true },
    );
  }

  const includeBalances = options.includeBalances !== false;
  let status: ConnectionStatus;
  try {
    status = await session.api.getConnectionStatus();
  } catch (err) {
    throw normalizeConnectorError(err);
  }

  if (status.status === 'disconnected') {
    throw new LaceMidnightKitError(
      KitErrorCodes.ConnectionLost,
      'Wallet reported disconnected during refresh.',
      { recoverable: true },
    );
  }

  let configuration: Configuration | null = session.configuration;
  try {
    configuration = await session.api.getConfiguration();
  } catch {
    /* keep previous */
  }

  const addresses = await readAddresses(session.api);
  const balances = includeBalances
    ? await readBalancesSafely(session.api)
    : { unshielded: null, shielded: null, dust: null, errors: ['balances skipped'] };

  return {
    ...session,
    status,
    configuration,
    addresses,
    networkId:
      status.status === 'connected' ? status.networkId : session.networkId,
    refreshedAt: new Date().toISOString(),
    balances,
  };
}
