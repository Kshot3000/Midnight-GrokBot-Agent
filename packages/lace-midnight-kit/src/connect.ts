import type {
  ConnectedAPI,
  Configuration,
  ConnectionStatus,
  InitialAPI,
  WalletConnectedAPI,
} from '@midnight-ntwrk/dapp-connector-api';

import {
  discoverProviders,
  findProvider,
  type DiscoveredProvider,
  type DiscoverOptions,
} from './discover.js';
import {
  KitErrorCodes,
  LaceMidnightKitError,
  normalizeConnectorError,
} from './errors.js';
import {
  DEFAULT_DEMO_NETWORK,
  type MidnightNetworkId,
} from './networks.js';

export type ConnectOptions = DiscoverOptions & {
  /** Network id passed to InitialAPI.connect. Default: preprod (test). */
  networkId?: MidnightNetworkId;
  /**
   * Which provider to use. If omitted and exactly one compatible wallet exists,
   * that wallet is used. If multiple exist, you must pass a selector or use
   * connectWithProvider after the user chooses.
   */
  provider?:
    | DiscoveredProvider
    | { injectionKey: string }
    | { rdns: string };
  /** After connect, verify getConnectionStatus().networkId matches. Default true. */
  assertNetworkMatch?: boolean;
  /**
   * Optionally hint methods the DApp expects to use (permissions UX).
   * Only discovery/address methods by default — this kit does not demo transfers.
   */
  hintUsage?: Array<keyof WalletConnectedAPI>;
};

export type ConnectedSession = {
  provider: DiscoveredProvider;
  api: ConnectedAPI;
  networkId: string;
  status: ConnectionStatus;
  configuration: Configuration | null;
  addresses: {
    unshieldedAddress: string | null;
    shieldedAddress: string | null;
    dustAddress: string | null;
  };
};

export async function refreshSessionAddresses(api: ConnectedAPI): Promise<ConnectedSession['addresses']> {
  const addresses: ConnectedSession['addresses'] = {
    unshieldedAddress: null,
    shieldedAddress: null,
    dustAddress: null,
  };

  // Unshielded is what the official React guide reads first.
  try {
    const u = await api.getUnshieldedAddress();
    addresses.unshieldedAddress = u.unshieldedAddress;
  } catch (err) {
    // Lace may throw "Wallet is unavailable" right after connect — surface later.
    const normalized = normalizeConnectorError(err);
    if (normalized.code === KitErrorCodes.WalletUnavailable) {
      throw normalized;
    }
    // PermissionRejected etc.: leave null
  }

  try {
    const s = await api.getShieldedAddresses();
    addresses.shieldedAddress = s.shieldedAddress;
  } catch {
    /* optional for connect demo */
  }

  try {
    const d = await api.getDustAddress();
    addresses.dustAddress = d.dustAddress;
  } catch {
    /* optional */
  }

  return addresses;
}

/**
 * Connect to a Midnight wallet via the DApp Connector InitialAPI.
 * Browser-only. Does not perform transfers.
 */
export async function connectMidnightWallet(
  options: ConnectOptions = {},
): Promise<ConnectedSession> {
  const networkId = options.networkId ?? DEFAULT_DEMO_NETWORK;
  const assertNetworkMatch = options.assertNetworkMatch !== false;

  const discovery = discoverProviders(options);
  if (discovery.compatible.length === 0) {
    throw new LaceMidnightKitError(
      KitErrorCodes.NoProviders,
      'No compatible Midnight wallet on window.midnight. Install Lace (Midnight), refresh, and enumerate providers — do not use window.midnight.mnLace.',
      { recoverable: true },
    );
  }

  let provider: DiscoveredProvider;
  if (options.provider && 'api' in options.provider && 'injectionKey' in options.provider) {
    provider = options.provider;
  } else if (options.provider && 'injectionKey' in options.provider) {
    provider = findProvider({ injectionKey: options.provider.injectionKey }, options);
  } else if (options.provider && 'rdns' in options.provider) {
    provider = findProvider({ rdns: options.provider.rdns }, options);
  } else if (discovery.compatible.length === 1) {
    provider = discovery.compatible[0]!;
  } else {
    throw new LaceMidnightKitError(
      KitErrorCodes.ProviderNotFound,
      `Multiple Midnight wallets found (${discovery.compatible.length}). Ask the user to choose, then call connectWithProvider(provider, options).`,
      { recoverable: true },
    );
  }

  return connectWithProvider(provider, {
    networkId,
    assertNetworkMatch,
    hintUsage: options.hintUsage,
  });
}

export type ConnectWithProviderOptions = {
  networkId?: MidnightNetworkId;
  assertNetworkMatch?: boolean;
  hintUsage?: Array<keyof WalletConnectedAPI>;
};

export async function connectWithProvider(
  provider: DiscoveredProvider,
  options: ConnectWithProviderOptions = {},
): Promise<ConnectedSession> {
  const networkId = options.networkId ?? DEFAULT_DEMO_NETWORK;
  const assertNetworkMatch = options.assertNetworkMatch !== false;
  const initial: InitialAPI = provider.api;

  let api: ConnectedAPI;
  try {
    api = await initial.connect(networkId);
  } catch (err) {
    throw normalizeConnectorError(err);
  }

  if (options.hintUsage?.length) {
    try {
      await api.hintUsage(options.hintUsage);
    } catch {
      /* hint is best-effort */
    }
  }

  let status: ConnectionStatus;
  try {
    status = await api.getConnectionStatus();
  } catch (err) {
    throw normalizeConnectorError(err);
  }

  if (status.status === 'disconnected') {
    throw new LaceMidnightKitError(
      KitErrorCodes.ConnectionLost,
      'Wallet reported disconnected immediately after connect.',
      { recoverable: true },
    );
  }

  if (
    assertNetworkMatch &&
    status.status === 'connected' &&
    status.networkId !== networkId
  ) {
    throw new LaceMidnightKitError(
      KitErrorCodes.NetworkMismatch,
      `Requested network "${networkId}" but wallet reports "${status.networkId}".`,
      { cause: status, recoverable: true },
    );
  }

  let configuration: Configuration | null = null;
  try {
    configuration = await api.getConfiguration();
  } catch (err) {
    const normalized = normalizeConnectorError(err);
    // Known Lace issue: getConfiguration can throw Wallet unavailable after connect.
    if (normalized.code !== KitErrorCodes.WalletUnavailable) {
      // keep going with null config for address-only demos
    }
  }

  const addresses = await refreshSessionAddresses(api);

  return {
    provider,
    api,
    networkId:
      status.status === 'connected' ? status.networkId : String(networkId),
    status,
    configuration,
    addresses,
  };
}

/**
 * Soft disconnect for demos: drop local references.
 * The connector API does not define a global disconnect(); clearing app state is enough.
 * Pass the previous session's api through checkSessionHealth if you need to confirm Lace still reports connected.
 */
export function createDisconnectedSession(): null {
  return null;
}

