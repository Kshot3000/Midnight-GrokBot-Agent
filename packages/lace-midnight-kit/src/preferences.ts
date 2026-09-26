/**
 * Persist Lace Connect preferences in localStorage (browser).
 * Survives reloads; never stores private keys or mnemonic material.
 */

import type { DiscoveredProvider } from './discover.js';

export const LACE_PREF_KEYS = {
  networkId: 'midnight-lab.lace.networkId',
  preferredRdns: 'midnight-lab.lace.preferredRdns',
  demoMode: 'midnight-lab.lace.demoMode',
} as const;

export type LacePreferences = {
  networkId: string | null;
  preferredRdns: string | null;
  demoMode: boolean;
};

function getStorage(storage?: Storage | null): Storage | null {
  if (storage !== undefined) return storage;
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Load persisted network / preferred wallet rdns / demo flag. */
export function loadLacePreferences(storage?: Storage | null): LacePreferences {
  const ls = getStorage(storage);
  if (!ls) {
    return { networkId: null, preferredRdns: null, demoMode: false };
  }
  try {
    return {
      networkId: ls.getItem(LACE_PREF_KEYS.networkId),
      preferredRdns: ls.getItem(LACE_PREF_KEYS.preferredRdns),
      demoMode: ls.getItem(LACE_PREF_KEYS.demoMode) === '1',
    };
  } catch {
    return { networkId: null, preferredRdns: null, demoMode: false };
  }
}

export function saveNetworkPreference(
  networkId: string,
  storage?: Storage | null,
): void {
  const ls = getStorage(storage);
  if (!ls) return;
  try {
    ls.setItem(LACE_PREF_KEYS.networkId, networkId);
  } catch {
    /* quota / private mode */
  }
}

/** Persist last chosen wallet by stable rdns (not UUID injection key). */
export function savePreferredWalletRdns(
  rdns: string,
  storage?: Storage | null,
): void {
  const ls = getStorage(storage);
  if (!ls) return;
  const trimmed = rdns.trim();
  if (!trimmed) return;
  try {
    ls.setItem(LACE_PREF_KEYS.preferredRdns, trimmed);
  } catch {
    /* ignore */
  }
}

export function saveDemoModePreference(
  enabled: boolean,
  storage?: Storage | null,
): void {
  const ls = getStorage(storage);
  if (!ls) return;
  try {
    ls.setItem(LACE_PREF_KEYS.demoMode, enabled ? '1' : '0');
  } catch {
    /* ignore */
  }
}

export function clearLacePreferences(storage?: Storage | null): void {
  const ls = getStorage(storage);
  if (!ls) return;
  try {
    ls.removeItem(LACE_PREF_KEYS.networkId);
    ls.removeItem(LACE_PREF_KEYS.preferredRdns);
    ls.removeItem(LACE_PREF_KEYS.demoMode);
  } catch {
    /* ignore */
  }
}

/**
 * Pick a provider matching the preferred rdns, else first compatible.
 * Returns null when the list is empty.
 */
export function pickPreferredProvider(
  providers: DiscoveredProvider[],
  preferredRdns: string | null | undefined,
): DiscoveredProvider | null {
  if (!providers.length) return null;
  const needle = (preferredRdns ?? '').trim().toLowerCase();
  if (needle) {
    const match = providers.find(
      (p) => (p.api.rdns ?? '').trim().toLowerCase() === needle,
    );
    if (match) return match;
  }
  return providers[0] ?? null;
}
