/**
 * Post-connect capability probe — read-only method availability.
 * Never calls makeTransfer / submit / balance-mutating APIs.
 * Optional proving/sign methods are feature-detected only (not invoked).
 */

import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';

export type CapabilityStatus = 'ok' | 'denied' | 'unavailable' | 'skipped' | 'unknown';

export type CapabilityProbeRow = {
  id: string;
  label: string;
  method: string;
  status: CapabilityStatus;
  detail: string;
};

export type CapabilityProbe = {
  generatedAt: string;
  rows: CapabilityProbeRow[];
  okCount: number;
  /** Honest scope note for UI banners. */
  scopeNote: string;
};

export type CapabilityProbeOptions = {
  /**
   * Also probe balance read methods (getUnshieldedBalances / getShieldedBalances / getDustBalance).
   * Default true. Still never calls makeTransfer.
   */
  includeBalances?: boolean;
};

const SCOPE =
  'Read-only probe. makeTransfer / submit are intentionally not called — a green connect is not proof transfers work. getProvingProvider / signData are feature-detected only.';

/**
 * Methods the v4 connector allows but Lace does not implement.
 * Docs: feature-detect before calling. Do not hard-code proverServerUri.
 * @see https://docs.midnight.network/sdks/community/wallets/community-wallets-integration
 */
export const OPTIONAL_CONNECTOR_METHODS = [
  {
    id: 'proving',
    label: 'ZK proving delegate',
    method: 'getProvingProvider',
    presentDetail:
      'Present. Wallet can prove. This probe does not call it.',
    absentDetail:
      'Absent (expected on Lace). Fall back to local proof server http://localhost:6300. Do not hard-code Configuration.proverServerUri. LOCAL-TRUE until a proof is produced.',
  },
  {
    id: 'sign-data',
    label: 'signData',
    method: 'signData',
    presentDetail: 'Present. This probe does not call it.',
    absentDetail:
      'Absent (expected on Lace). Do not use signature auth against this wallet.',
  },
] as const;

/**
 * Feature-detect optional ConnectedAPI methods without invoking them.
 * Lace has neither getProvingProvider nor signData.
 */
export function featureDetectOptionalMethods(
  api: object | null | undefined,
): CapabilityProbeRow[] {
  const target = api ?? {};
  return OPTIONAL_CONNECTOR_METHODS.map((row) => {
    const present = typeof (target as Record<string, unknown>)[row.method] === 'function';
    return {
      id: row.id,
      label: row.label,
      method: row.method,
      status: present ? 'ok' : 'unavailable',
      detail: present ? row.presentDetail : row.absentDetail,
    };
  });
}

async function tryMethod(
  id: string,
  label: string,
  method: string,
  fn: () => Promise<unknown>,
): Promise<CapabilityProbeRow> {
  try {
    await fn();
    return { id, label, method, status: 'ok', detail: 'Responded' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const lower = msg.toLowerCase();
    if (lower.includes('permission') || lower.includes('rejected')) {
      return { id, label, method, status: 'denied', detail: msg.slice(0, 160) };
    }
    if (lower.includes('unavailable')) {
      return { id, label, method, status: 'unavailable', detail: msg.slice(0, 160) };
    }
    return { id, label, method, status: 'unavailable', detail: msg.slice(0, 160) };
  }
}

/**
 * Probe which ConnectedAPI read methods respond after connect.
 * Safe for demos — does not transfer and does not call proving.
 */
export async function probeSessionCapabilities(
  api: ConnectedAPI,
  options: CapabilityProbeOptions = {},
): Promise<CapabilityProbe> {
  const includeBalances = options.includeBalances !== false;
  const generatedAt = new Date().toISOString();
  const rows: CapabilityProbeRow[] = [];

  rows.push(
    await tryMethod('status', 'Connection status', 'getConnectionStatus', () =>
      api.getConnectionStatus(),
    ),
  );
  rows.push(
    await tryMethod('unshielded', 'Unshielded address', 'getUnshieldedAddress', () =>
      api.getUnshieldedAddress(),
    ),
  );
  rows.push(
    await tryMethod('shielded', 'Shielded address', 'getShieldedAddresses', () =>
      api.getShieldedAddresses(),
    ),
  );
  rows.push(
    await tryMethod('dust', 'Dust address', 'getDustAddress', () => api.getDustAddress()),
  );
  rows.push(
    await tryMethod('config', 'Configuration', 'getConfiguration', () =>
      api.getConfiguration(),
    ),
  );

  if (includeBalances) {
    rows.push(
      await tryMethod(
        'bal-unshielded',
        'Unshielded balances',
        'getUnshieldedBalances',
        () => api.getUnshieldedBalances(),
      ),
    );
    rows.push(
      await tryMethod(
        'bal-shielded',
        'Shielded balances',
        'getShieldedBalances',
        () => api.getShieldedBalances(),
      ),
    );
    rows.push(
      await tryMethod('bal-dust', 'Dust balance', 'getDustBalance', () =>
        api.getDustBalance(),
      ),
    );
  }

  rows.push(...featureDetectOptionalMethods(api));

  rows.push({
    id: 'transfer',
    label: 'Transfers',
    method: 'makeTransfer',
    status: 'skipped',
    detail: 'Not probed by this kit — demo scope is discovery + connect only.',
  });
  rows.push({
    id: 'submit',
    label: 'Submit tx',
    method: 'submitTransaction',
    status: 'skipped',
    detail: 'Not probed — would mutate chain state.',
  });

  const okCount = rows.filter((r) => r.status === 'ok').length;
  return { generatedAt, rows, okCount, scopeNote: SCOPE };
}
