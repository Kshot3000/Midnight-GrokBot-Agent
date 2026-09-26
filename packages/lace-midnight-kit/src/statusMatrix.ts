/**
 * Connect status matrix — diagnostic snapshot for Lace / Midnight DApp Connector demos.
 * Read-only: never calls connect / makeTransfer.
 */
import type { InitialAPI } from '@midnight-ntwrk/dapp-connector-api';

import {
  discoverProviders,
  safeWalletLabel,
  type DiscoverOptions,
  type DiscoveredProvider,
} from './discover.js';
import { semverSatisfies } from './semver.js';

export type MatrixRowStatus = 'ok' | 'warn' | 'bad' | 'info' | 'unknown';

export type StatusMatrixRow = {
  id: string;
  label: string;
  status: MatrixRowStatus;
  detail: string;
};

export type ProviderMatrixEntry = {
  injectionKey: string;
  name: string;
  rdns: string;
  apiVersion: string;
  compatibleV4: boolean;
  hasConnect: boolean;
  /** Legacy enable() path (older Lace / tutorial samples). */
  hasEnable: boolean;
  isLegacyMnLaceKey: boolean;
};

export type StatusMatrix = {
  generatedAt: string;
  hasWindow: boolean;
  hasMidnightObject: boolean;
  injectionKeyCount: number;
  injectionKeysPreview: string[];
  legacyMnLacePresent: boolean;
  providers: ProviderMatrixEntry[];
  compatibleV4Count: number;
  hasDuplicateRdns: boolean;
  rows: StatusMatrixRow[];
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function providerEntry(p: DiscoveredProvider): ProviderMatrixEntry {
  const api = p.api as InitialAPI & { enable?: unknown };
  const raw = asRecord(api) ?? {};
  return {
    injectionKey: p.injectionKey,
    name: safeWalletLabel(p.api),
    rdns: String(p.api.rdns ?? ''),
    apiVersion: String(p.api.apiVersion ?? ''),
    compatibleV4: semverSatisfies(String(p.api.apiVersion ?? ''), '^4.0.0'),
    hasConnect: typeof api.connect === 'function',
    hasEnable: typeof raw.enable === 'function',
    isLegacyMnLaceKey: p.injectionKey === 'mnLace',
  };
}

/**
 * Probe `window.midnight` and build a human-readable status matrix.
 * Safe to call without Lace installed — returns empty/warn rows.
 */
export function probeStatusMatrix(options: DiscoverOptions = {}): StatusMatrix {
  const generatedAt = new Date().toISOString();
  const hasWindow = typeof window !== 'undefined';
  if (!hasWindow) {
    return {
      generatedAt,
      hasWindow: false,
      hasMidnightObject: false,
      injectionKeyCount: 0,
      injectionKeysPreview: [],
      legacyMnLacePresent: false,
      providers: [],
      compatibleV4Count: 0,
      hasDuplicateRdns: false,
      rows: [
        {
          id: 'window',
          label: 'Browser window',
          status: 'bad',
          detail: 'window is undefined — Lace connector is browser-only.',
        },
      ],
    };
  }

  const midnight = window.midnight as Record<string, unknown> | undefined;
  const hasMidnightObject = Boolean(midnight);
  const injectionKeys = midnight ? Object.keys(midnight) : [];
  const legacyMnLacePresent = Boolean(
    midnight && Object.prototype.hasOwnProperty.call(midnight, 'mnLace') && midnight.mnLace,
  );

  const discovery = discoverProviders({
    apiVersionRange: options.apiVersionRange === undefined ? '^4.0.0' : options.apiVersionRange,
    throwOnDuplicateRdns: false,
  });

  const providers = discovery.providers.map(providerEntry);
  const compatibleV4Count = providers.filter((p) => p.compatibleV4).length;

  const rows: StatusMatrixRow[] = [
    {
      id: 'window',
      label: 'Browser window',
      status: 'ok',
      detail: 'Available',
    },
    {
      id: 'midnight-object',
      label: 'window.midnight',
      status: hasMidnightObject ? 'ok' : 'warn',
      detail: hasMidnightObject
        ? `Present · ${injectionKeys.length} key(s)`
        : 'Missing — install Lace with Midnight enabled, then refresh this tab.',
    },
    {
      id: 'enumerate',
      label: 'Enumerate providers',
      status: providers.length > 0 ? 'ok' : hasMidnightObject ? 'warn' : 'bad',
      detail:
        providers.length > 0
          ? `${providers.length} provider(s) with connect()`
          : 'No providers with a connect() method on window.midnight.',
    },
    {
      id: 'legacy-mnLace',
      label: 'Legacy mnLace key',
      status: legacyMnLacePresent
        ? 'info'
        : hasMidnightObject
          ? 'ok'
          : 'unknown',
      detail: legacyMnLacePresent
        ? 'window.midnight.mnLace is present (alias). Prefer UUID enumeration — do not hardcode this key.'
        : hasMidnightObject
          ? 'mnLace absent/undefined (expected with UUID injection). Enumeration still works.'
          : 'N/A until window.midnight exists.',
    },
    {
      id: 'api-v4',
      label: 'DApp Connector ^4.0.0',
      status:
        compatibleV4Count > 0
          ? 'ok'
          : providers.length > 0
            ? 'warn'
            : 'unknown',
      detail:
        compatibleV4Count > 0
          ? `${compatibleV4Count} compatible provider(s)`
          : providers.length > 0
            ? 'Providers found but none match ^4.0.0 — check Lace / connector versions.'
            : 'No providers to version-check yet.',
    },
    {
      id: 'duplicate-rdns',
      label: 'Duplicate rdns',
      status: discovery.hasDuplicateRdns ? 'warn' : providers.length ? 'ok' : 'unknown',
      detail: discovery.hasDuplicateRdns
        ? 'Multiple providers share an rdns — present choices and warn about spoofing.'
        : providers.length
          ? 'No duplicate rdns among compatible providers.'
          : 'N/A',
    },
    {
      id: 'scope',
      label: 'Demo scope',
      status: 'info',
      detail:
        'Discovery + connect/status only. No makeTransfer / submit — a green connect is not proof transfers work.',
    },
  ];

  return {
    generatedAt,
    hasWindow: true,
    hasMidnightObject,
    injectionKeyCount: injectionKeys.length,
    injectionKeysPreview: injectionKeys.slice(0, 8).map((k) =>
      k.length > 12 ? `${k.slice(0, 8)}…` : k,
    ),
    legacyMnLacePresent,
    providers,
    compatibleV4Count,
    hasDuplicateRdns: discovery.hasDuplicateRdns,
    rows,
  };
}
