/**
 * Common Midnight network id strings used with InitialAPI.connect(networkId).
 * Prefer test / preview networks for demos. Do not assume mainnet transfers work
 * until you have verified your Lace + connector + ledger stack against the
 * official compatibility matrix.
 *
 * Official guide examples use values such as `preprod`, `preview`, `undeployed`.
 * Spec uses `mainnet` for mainnet.
 */
export const MidnightNetworkIds = {
  /** Local / undeployed development */
  Undeployed: 'undeployed',
  /** Preview test network */
  Preview: 'preview',
  /** Preprod test network (common Lace Midnight target) */
  Preprod: 'preprod',
  /** Mainnet — transfers require a fully working wallet + funded account */
  Mainnet: 'mainnet',
} as const;

export type MidnightNetworkId =
  | (typeof MidnightNetworkIds)[keyof typeof MidnightNetworkIds]
  | (string & {});

/** Default network for this lab's demo: Preprod (test). */
export const DEFAULT_DEMO_NETWORK: MidnightNetworkId =
  MidnightNetworkIds.Preprod;

/**
 * Catalog row for Connect Studio network pills / switch UX.
 * Labels are informational — connect() still uses the raw `id` string.
 */
export type NetworkCatalogEntry = {
  id: MidnightNetworkId;
  label: string;
  hint: string;
  tone: 'ok' | 'info' | 'warn';
  /** Prefer for demos (test networks). */
  recommended?: boolean;
  /** Connect-only: do not imply transfers work. */
  connectOnly?: boolean;
};

export const NETWORK_CATALOG: readonly NetworkCatalogEntry[] = [
  {
    id: MidnightNetworkIds.Preprod,
    label: 'preprod',
    hint: 'Test — default',
    tone: 'ok',
    recommended: true,
  },
  {
    id: MidnightNetworkIds.Preview,
    label: 'preview',
    hint: 'Test',
    tone: 'ok',
    recommended: true,
  },
  {
    id: MidnightNetworkIds.Undeployed,
    label: 'undeployed',
    hint: 'Local / undeployed',
    tone: 'info',
  },
  {
    id: MidnightNetworkIds.Mainnet,
    label: 'mainnet',
    hint: 'Connect only — no transfer demo',
    tone: 'warn',
    connectOnly: true,
  },
] as const;

export function findNetworkCatalogEntry(
  id: string,
): NetworkCatalogEntry | undefined {
  return NETWORK_CATALOG.find((n) => n.id === id);
}

export type NetworkSwitchPlan = {
  changed: boolean;
  fromId: string | null;
  toId: string;
  /** True when a live session used a different networkId than the new preference. */
  requiresReconnect: boolean;
  message: string;
};

/**
 * Describe a network preference change for UX.
 * Does not call the wallet — the demo clears the local session and prompts reconnect.
 */
export function describeNetworkSwitch(
  fromId: string | null | undefined,
  toId: string,
): NetworkSwitchPlan {
  const from = fromId ?? null;
  const changed = from !== toId;
  if (!changed) {
    return {
      changed: false,
      fromId: from,
      toId,
      requiresReconnect: false,
      message: `Network preference already ${toId}.`,
    };
  }
  const toEntry = findNetworkCatalogEntry(toId);
  const warn = toEntry?.connectOnly
    ? ' Mainnet is connect/status only — this lab never demos transfers.'
    : '';
  if (from) {
    return {
      changed: true,
      fromId: from,
      toId,
      requiresReconnect: true,
      message: `Switched preference ${from} → ${toId}. Reconnect so Lace connect() uses the new networkId.${warn}`,
    };
  }
  return {
    changed: true,
    fromId: null,
    toId,
    requiresReconnect: false,
    message: `Network preference set to ${toId}.${warn}`,
  };
}
