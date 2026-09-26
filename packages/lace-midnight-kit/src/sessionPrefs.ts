/**
 * Persist connect preferences + last successful session *snapshot* in localStorage.
 * Never persists ConnectedAPI (live wallet handle cannot survive reload).
 * Browser-only; safe no-ops when localStorage is unavailable.
 */

import { DEFAULT_DEMO_NETWORK, type MidnightNetworkId } from './networks.js';
import type { ConnectedSession } from './connect.js';
import { safeWalletLabel } from './discover.js';
import { isDemoSession } from './demoMode.js';

export const SESSION_PREFS_STORAGE_KEY = 'midnight-lab.lace.sessionPrefs.v1';

export type SessionAddressSnapshot = {
  unshieldedAddress: string | null;
  shieldedAddress: string | null;
  dustAddress: string | null;
};

export type SessionPrefs = {
  version: 1;
  networkId: MidnightNetworkId;
  preferredInjectionKey: string | null;
  preferredRdns: string | null;
  preferredWalletName: string | null;
  /** Last successful real (non-demo) connect snapshot for UI restore / reconnect hints. */
  lastSession: {
    networkId: string;
    walletName: string;
    rdns: string;
    injectionKey: string;
    addresses: SessionAddressSnapshot;
    connectedAt: string;
    status: string;
  } | null;
  updatedAt: string;
};

export function defaultSessionPrefs(
  networkId: MidnightNetworkId = DEFAULT_DEMO_NETWORK,
): SessionPrefs {
  return {
    version: 1,
    networkId,
    preferredInjectionKey: null,
    preferredRdns: null,
    preferredWalletName: null,
    lastSession: null,
    updatedAt: new Date().toISOString(),
  };
}

function canUseStorage(): boolean {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

export function loadSessionPrefs(
  storageKey: string = SESSION_PREFS_STORAGE_KEY,
): SessionPrefs {
  if (!canUseStorage()) return defaultSessionPrefs();
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return defaultSessionPrefs();
    const parsed = JSON.parse(raw) as Partial<SessionPrefs>;
    if (!parsed || parsed.version !== 1) return defaultSessionPrefs();
    const base = defaultSessionPrefs(
      (parsed.networkId as MidnightNetworkId) || DEFAULT_DEMO_NETWORK,
    );
    return {
      ...base,
      networkId: (parsed.networkId as MidnightNetworkId) || base.networkId,
      preferredInjectionKey: parsed.preferredInjectionKey ?? null,
      preferredRdns: parsed.preferredRdns ?? null,
      preferredWalletName: parsed.preferredWalletName ?? null,
      lastSession: parsed.lastSession ?? null,
      updatedAt: parsed.updatedAt || base.updatedAt,
    };
  } catch {
    return defaultSessionPrefs();
  }
}

export function saveSessionPrefs(
  prefs: SessionPrefs,
  storageKey: string = SESSION_PREFS_STORAGE_KEY,
): SessionPrefs {
  const next: SessionPrefs = {
    ...prefs,
    version: 1,
    updatedAt: new Date().toISOString(),
  };
  if (canUseStorage()) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* quota / private mode */
    }
  }
  return next;
}

export function clearSessionPrefs(
  storageKey: string = SESSION_PREFS_STORAGE_KEY,
): SessionPrefs {
  if (canUseStorage()) {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
  }
  return defaultSessionPrefs();
}

export function snapshotFromSession(session: ConnectedSession): SessionPrefs['lastSession'] {
  if (isDemoSession(session)) return null;
  const status =
    session.status.status === 'connected'
      ? `connected:${session.status.networkId}`
      : session.status.status;
  return {
    networkId: session.networkId,
    walletName: safeWalletLabel(session.provider.api),
    rdns: session.provider.api.rdns ?? '',
    injectionKey: session.provider.injectionKey,
    addresses: { ...session.addresses },
    connectedAt: new Date().toISOString(),
    status,
  };
}

/**
 * Merge a successful connect into prefs (network + preferred wallet + snapshot).
 */
export function rememberSuccessfulConnect(
  session: ConnectedSession,
  storageKey: string = SESSION_PREFS_STORAGE_KEY,
): SessionPrefs {
  const current = loadSessionPrefs(storageKey);
  if (isDemoSession(session)) {
    return saveSessionPrefs(
      {
        ...current,
        networkId: session.networkId as MidnightNetworkId,
      },
      storageKey,
    );
  }
  return saveSessionPrefs(
    {
      ...current,
      networkId: session.networkId as MidnightNetworkId,
      preferredInjectionKey: session.provider.injectionKey,
      preferredRdns: session.provider.api.rdns ?? null,
      preferredWalletName: safeWalletLabel(session.provider.api),
      lastSession: snapshotFromSession(session),
    },
    storageKey,
  );
}

export function setPreferredNetwork(
  networkId: MidnightNetworkId,
  storageKey: string = SESSION_PREFS_STORAGE_KEY,
): SessionPrefs {
  const current = loadSessionPrefs(storageKey);
  return saveSessionPrefs({ ...current, networkId }, storageKey);
}

export function setPreferredProvider(
  opts: { injectionKey?: string | null; rdns?: string | null; walletName?: string | null },
  storageKey: string = SESSION_PREFS_STORAGE_KEY,
): SessionPrefs {
  const current = loadSessionPrefs(storageKey);
  return saveSessionPrefs(
    {
      ...current,
      preferredInjectionKey:
        opts.injectionKey === undefined
          ? current.preferredInjectionKey
          : opts.injectionKey,
      preferredRdns: opts.rdns === undefined ? current.preferredRdns : opts.rdns,
      preferredWalletName:
        opts.walletName === undefined
          ? current.preferredWalletName
          : opts.walletName,
    },
    storageKey,
  );
}
