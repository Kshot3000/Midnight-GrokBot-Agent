/**
 * Reconnect using persisted prefs + live discovery.
 * Prefer injectionKey match, then rdns, then first compatible.
 */

import {
  connectWithProvider,
  type ConnectedSession,
  type ConnectWithProviderOptions,
} from './connect.js';
import {
  discoverProviders,
  findProvider,
  type DiscoverOptions,
  type DiscoveredProvider,
} from './discover.js';
import { KitErrorCodes, LaceMidnightKitError } from './errors.js';
import type { MidnightNetworkId } from './networks.js';
import {
  loadSessionPrefs,
  type SessionPrefs,
  SESSION_PREFS_STORAGE_KEY,
} from './sessionPrefs.js';

export type ReconnectOptions = DiscoverOptions &
  ConnectWithProviderOptions & {
    prefs?: SessionPrefs;
    storageKey?: string;
  };

/**
 * Resolve preferred provider from prefs against current discovery.
 */
export function resolvePreferredProvider(
  prefs: SessionPrefs,
  discoverOpts?: DiscoverOptions,
): DiscoveredProvider {
  const discovery = discoverProviders(discoverOpts);
  if (discovery.compatible.length === 0 && discovery.providers.length === 0) {
    throw new LaceMidnightKitError(
      KitErrorCodes.NoProviders,
      'No Midnight wallet found for reconnect. Install Lace with Midnight enabled and refresh.',
      { recoverable: true },
    );
  }
  const pool =
    discovery.compatible.length > 0 ? discovery.compatible : discovery.providers;

  if (prefs.preferredInjectionKey) {
    const byKey = pool.find((p) => p.injectionKey === prefs.preferredInjectionKey);
    if (byKey) return byKey;
  }
  if (prefs.preferredRdns) {
    try {
      return findProvider({ rdns: prefs.preferredRdns }, discoverOpts);
    } catch {
      /* fall through */
    }
  }
  if (prefs.preferredWalletName) {
    const needle = prefs.preferredWalletName.toLowerCase();
    const byName = pool.find((p) =>
      (p.api.name ?? '').toLowerCase().includes(needle),
    );
    if (byName) return byName;
  }
  return pool[0]!;
}

/**
 * Connect using saved session prefs (network + preferred wallet).
 * Requires Lace to be injected — this is a real connect(), not a snapshot restore.
 */
export async function reconnectFromPrefs(
  options: ReconnectOptions = {},
): Promise<{ session: ConnectedSession; prefs: SessionPrefs; provider: DiscoveredProvider }> {
  const storageKey = options.storageKey ?? SESSION_PREFS_STORAGE_KEY;
  const prefs = options.prefs ?? loadSessionPrefs(storageKey);
  const networkId = (options.networkId ?? prefs.networkId) as MidnightNetworkId;
  const provider = resolvePreferredProvider(prefs, {
    apiVersionRange:
      options.apiVersionRange === undefined ? '^4.0.0' : options.apiVersionRange,
    throwOnDuplicateRdns: options.throwOnDuplicateRdns,
  });
  const session = await connectWithProvider(provider, {
    networkId,
    assertNetworkMatch: options.assertNetworkMatch,
    hintUsage: options.hintUsage ?? [
      'getConnectionStatus',
      'getUnshieldedAddress',
      'getShieldedAddresses',
      'getDustAddress',
      'getConfiguration',
      'getUnshieldedBalances',
      'getDustBalance',
    ],
  });
  return { session, prefs, provider };
}
