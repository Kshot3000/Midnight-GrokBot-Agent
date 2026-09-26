import type { InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
import '@midnight-ntwrk/dapp-connector-api'; // side-effect: Window.midnight typing

import { KitErrorCodes, LaceMidnightKitError } from './errors.js';
import { semverSatisfies } from './semver.js';

/**
 * Discovered provider entry. Prefer this over hardcoded `window.midnight.mnLace`.
 * Lace (and other wallets) inject under a fresh UUID key each page load.
 */
export type DiscoveredProvider = {
  /** UUID (or other) key under window.midnight */
  injectionKey: string;
  api: InitialAPI;
};

export type DiscoverOptions = {
  /**
   * Semver range for InitialAPI.apiVersion (caret or exact).
   * Default `^4.0.0` matches DApp Connector 4.x (matrix often pins 4.0.1).
   * Pass `*` or omit filtering with `apiVersionRange: null`.
   */
  apiVersionRange?: string | null;
  /** If true, throw when duplicate rdns values are present among compatible wallets. */
  throwOnDuplicateRdns?: boolean;
};

export type DiscoverResult = {
  providers: DiscoveredProvider[];
  /** Compatible providers after apiVersion filter */
  compatible: DiscoveredProvider[];
  /** True when two+ compatible providers share the same trimmed rdns */
  hasDuplicateRdns: boolean;
  /** Raw keys present on window.midnight (including incompatible) */
  injectionKeys: string[];
};

function assertBrowser(): void {
  if (typeof window === 'undefined') {
    throw new LaceMidnightKitError(
      KitErrorCodes.NoWindow,
      'window is undefined — Lace Midnight connector is browser-only.',
    );
  }
}

/**
 * Enumerate wallets injected on `window.midnight`.
 * Do NOT use `window.midnight.mnLace` — keys are UUIDs; hardcoded names are often undefined.
 *
 * @see https://docs.midnight.network/guides/react-wallet-connect
 * @see https://github.com/midnightntwrk/midnight-dapp-connector-api
 */
export function discoverProviders(
  options: DiscoverOptions = {},
): DiscoverResult {
  assertBrowser();

  const midnight = window.midnight;
  if (!midnight) {
    return {
      providers: [],
      compatible: [],
      hasDuplicateRdns: false,
      injectionKeys: [],
    };
  }

  const injectionKeys = Object.keys(midnight);
  const providers: DiscoveredProvider[] = [];

  for (const key of injectionKeys) {
    const api = midnight[key];
    if (!api || typeof api.connect !== 'function') continue;
    providers.push({ injectionKey: key, api });
  }

  const range = options.apiVersionRange === undefined ? '^4.0.0' : options.apiVersionRange;

  const compatible =
    range === null || range === '*'
      ? [...providers]
      : providers.filter((p) => semverSatisfies(p.api.apiVersion, range));

  const rdnsCounts = new Map<string, number>();
  for (const p of compatible) {
    const rdns = (p.api.rdns ?? '').trim().toLowerCase();
    if (!rdns) continue;
    rdnsCounts.set(rdns, (rdnsCounts.get(rdns) ?? 0) + 1);
  }
  const hasDuplicateRdns = [...rdnsCounts.values()].some((n) => n > 1);

  if (hasDuplicateRdns && options.throwOnDuplicateRdns) {
    throw new LaceMidnightKitError(
      KitErrorCodes.DuplicateRdns,
      'Multiple Midnight providers share the same rdns. Present choices to the user and warn about possible spoofing.',
      { recoverable: true },
    );
  }

  return { providers, compatible, hasDuplicateRdns, injectionKeys };
}

/**
 * Convenience: list InitialAPI values only (compatible by default).
 */
export function listCompatibleWallets(
  options?: DiscoverOptions,
): InitialAPI[] {
  return discoverProviders(options).compatible.map((p) => p.api);
}

/**
 * Pick a provider by injection key, rdns, or first compatible.
 * Still prefer letting the user choose when multiple wallets exist.
 */
export function findProvider(
  selector:
    | { injectionKey: string }
    | { rdns: string }
    | { preferRdnsIncludes?: string; firstCompatible?: boolean },
  options?: DiscoverOptions,
): DiscoveredProvider {
  const { compatible } = discoverProviders(options);

  if (compatible.length === 0) {
    throw new LaceMidnightKitError(
      KitErrorCodes.NoProviders,
      'No Midnight wallet found. Install Lace with Midnight enabled and refresh the page. Do not hardcode window.midnight.mnLace.',
      { recoverable: true },
    );
  }

  if ('injectionKey' in selector) {
    const found = compatible.find((p) => p.injectionKey === selector.injectionKey);
    if (!found) {
      throw new LaceMidnightKitError(
        KitErrorCodes.ProviderNotFound,
        `No compatible provider with injectionKey=${selector.injectionKey}`,
        { recoverable: true },
      );
    }
    return found;
  }

  if ('rdns' in selector) {
    const target = selector.rdns.trim().toLowerCase();
    const found = compatible.find(
      (p) => (p.api.rdns ?? '').trim().toLowerCase() === target,
    );
    if (!found) {
      throw new LaceMidnightKitError(
        KitErrorCodes.ProviderNotFound,
        `No compatible provider with rdns=${selector.rdns}`,
        { recoverable: true },
      );
    }
    return found;
  }

  if (selector.preferRdnsIncludes) {
    const needle = selector.preferRdnsIncludes.toLowerCase();
    const preferred = compatible.find((p) =>
      (p.api.rdns ?? '').toLowerCase().includes(needle),
    );
    if (preferred) return preferred;
  }

  return compatible[0]!;
}

/**
 * Sanitize wallet name for text display (XSS: never inject as HTML).
 */
export function safeWalletLabel(api: InitialAPI): string {
  return String(api.name ?? 'Unknown wallet').replace(/[\u0000-\u001F<>]/g, '');
}

/**
 * Only use as <img src="..."> — never insert icon URL into innerHTML.
 */
export function safeIconUrl(api: InitialAPI): string | null {
  const icon = api.icon?.trim();
  if (!icon) return null;
  if (
    icon.startsWith('data:image/') ||
    icon.startsWith('https://') ||
    icon.startsWith('http://')
  ) {
    return icon;
  }
  return null;
}
