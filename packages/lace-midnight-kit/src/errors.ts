import type { APIError, ErrorCode } from '@midnight-ntwrk/dapp-connector-api';
import { ErrorCodes } from '@midnight-ntwrk/dapp-connector-api';

export { ErrorCodes };
export type { APIError, ErrorCode };

/** Stable error codes from this kit (in addition to connector APIError). */
export const KitErrorCodes = {
  NoWindow: 'NoWindow',
  NoProviders: 'NoProviders',
  ProviderNotFound: 'ProviderNotFound',
  IncompatibleApiVersion: 'IncompatibleApiVersion',
  DuplicateRdns: 'DuplicateRdns',
  UserCancelled: 'UserCancelled',
  ConnectionLost: 'ConnectionLost',
  NetworkMismatch: 'NetworkMismatch',
  WalletUnavailable: 'WalletUnavailable',
  Unknown: 'Unknown',
} as const;

export type KitErrorCode =
  | (typeof KitErrorCodes)[keyof typeof KitErrorCodes]
  | ErrorCode;

export class LaceMidnightKitError extends Error {
  readonly code: KitErrorCode;
  readonly cause?: unknown;
  readonly recoverable: boolean;

  constructor(
    code: KitErrorCode,
    message: string,
    options?: { cause?: unknown; recoverable?: boolean },
  ) {
    super(message);
    this.name = 'LaceMidnightKitError';
    this.code = code;
    this.cause = options?.cause;
    this.recoverable = options?.recoverable ?? false;
  }
}

export function isAPIError(error: unknown): error is APIError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    (error as { type: unknown }).type === 'DAppConnectorAPIError' &&
    'code' in error &&
    'reason' in error
  );
}

export function isLaceMidnightKitError(
  error: unknown,
): error is LaceMidnightKitError {
  return error instanceof LaceMidnightKitError;
}

/**
 * Normalize any thrown value into LaceMidnightKitError.
 * Maps Lace "Wallet is unavailable" strings and connector APIError codes.
 */
export function normalizeConnectorError(error: unknown): LaceMidnightKitError {
  if (isLaceMidnightKitError(error)) return error;

  if (isAPIError(error)) {
    const recoverable =
      error.code === ErrorCodes.Rejected ||
      error.code === ErrorCodes.PermissionRejected ||
      error.code === ErrorCodes.Disconnected;
    return new LaceMidnightKitError(error.code, error.reason || error.message, {
      cause: error,
      recoverable,
    });
  }

  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Unknown wallet / connector error';

  const lower = message.toLowerCase();
  if (
    lower.includes('wallet is unavailable') ||
    lower.includes('wallet unavailable')
  ) {
    return new LaceMidnightKitError(
      KitErrorCodes.WalletUnavailable,
      message,
      {
        cause: error,
        recoverable: true,
      },
    );
  }

  if (lower.includes('user rejected') || lower.includes('rejected')) {
    return new LaceMidnightKitError(KitErrorCodes.UserCancelled, message, {
      cause: error,
      recoverable: true,
    });
  }

  return new LaceMidnightKitError(KitErrorCodes.Unknown, message, {
    cause: error,
    recoverable: false,
  });
}

/** User-facing short hint for common failures. */
export function userHintForError(error: LaceMidnightKitError): string {
  switch (error.code) {
    case KitErrorCodes.NoWindow:
      return 'This kit only runs in a browser (Lace injects window.midnight).';
    case KitErrorCodes.NoProviders:
      return 'No Midnight wallet found. Install Lace with Midnight enabled, then refresh.';
    case KitErrorCodes.ProviderNotFound:
      return 'Selected injection key / rdns is no longer on window.midnight. Re-discover.';
    case KitErrorCodes.IncompatibleApiVersion:
      return 'Wallet API version is outside the range this DApp supports.';
    case KitErrorCodes.DuplicateRdns:
      return 'Multiple wallets share the same rdns — choose carefully; one may be spoofed.';
    case KitErrorCodes.WalletUnavailable:
      return 'Lace reported the wallet unavailable after connect. See WORKAROUNDS.md / wait for sync, restart extension.';
    case KitErrorCodes.NetworkMismatch:
      return 'Connected network id does not match the network you requested.';
    case ErrorCodes.Rejected:
    case KitErrorCodes.UserCancelled:
      return 'Connection or action was cancelled in the wallet.';
    case ErrorCodes.PermissionRejected:
      return 'Wallet denied permission for this action for the session.';
    case ErrorCodes.Disconnected:
    case KitErrorCodes.ConnectionLost:
      return 'Wallet connection was lost. Reconnect.';
    case ErrorCodes.InvalidRequest:
      return 'Wallet rejected the request as invalid.';
    case ErrorCodes.InternalError:
      return 'Wallet internal error. Check Lace sync / network status.';
    default:
      return error.message;
  }
}


/** One row in the Connect Studio error-code reference. */
export type ErrorCatalogEntry = {
  code: string;
  source: 'kit' | 'connector';
  recoverable: boolean;
  hint: string;
};

/**
 * Stable catalog of kit + common connector codes for UI help panels.
 * Hints match userHintForError where applicable.
 */
export const ERROR_CATALOG: readonly ErrorCatalogEntry[] = [
  {
    code: KitErrorCodes.NoWindow,
    source: 'kit',
    recoverable: false,
    hint: 'This kit only runs in a browser (Lace injects window.midnight).',
  },
  {
    code: KitErrorCodes.NoProviders,
    source: 'kit',
    recoverable: true,
    hint: 'No Midnight wallet found. Install Lace with Midnight enabled, then refresh.',
  },
  {
    code: KitErrorCodes.ProviderNotFound,
    source: 'kit',
    recoverable: true,
    hint: 'Selected injection key / rdns is no longer on window.midnight. Re-discover.',
  },
  {
    code: KitErrorCodes.IncompatibleApiVersion,
    source: 'kit',
    recoverable: false,
    hint: 'Wallet API version is outside the range this DApp supports.',
  },
  {
    code: KitErrorCodes.DuplicateRdns,
    source: 'kit',
    recoverable: true,
    hint: 'Multiple wallets share the same rdns — choose carefully; one may be spoofed.',
  },
  {
    code: KitErrorCodes.UserCancelled,
    source: 'kit',
    recoverable: true,
    hint: 'Connection or action was cancelled in the wallet.',
  },
  {
    code: KitErrorCodes.ConnectionLost,
    source: 'kit',
    recoverable: true,
    hint: 'Wallet connection was lost. Reconnect.',
  },
  {
    code: KitErrorCodes.NetworkMismatch,
    source: 'kit',
    recoverable: true,
    hint: 'Connected network id does not match the network you requested.',
  },
  {
    code: KitErrorCodes.WalletUnavailable,
    source: 'kit',
    recoverable: true,
    hint: 'Lace reported the wallet unavailable after connect. Wait for sync, restart extension, see WORKAROUNDS.md.',
  },
  {
    code: KitErrorCodes.Unknown,
    source: 'kit',
    recoverable: false,
    hint: 'Unrecognized wallet / connector error — check Lace sync and the activity log.',
  },
  {
    code: ErrorCodes.Rejected,
    source: 'connector',
    recoverable: true,
    hint: 'Connection or action was cancelled in the wallet.',
  },
  {
    code: ErrorCodes.PermissionRejected,
    source: 'connector',
    recoverable: true,
    hint: 'Wallet denied permission for this action for the session.',
  },
  {
    code: ErrorCodes.Disconnected,
    source: 'connector',
    recoverable: true,
    hint: 'Wallet connection was lost. Reconnect.',
  },
  {
    code: ErrorCodes.InvalidRequest,
    source: 'connector',
    recoverable: false,
    hint: 'Wallet rejected the request as invalid.',
  },
  {
    code: ErrorCodes.InternalError,
    source: 'connector',
    recoverable: true,
    hint: 'Wallet internal error. Check Lace sync / network status.',
  },
] as const;

export function listErrorCatalog(): readonly ErrorCatalogEntry[] {
  return ERROR_CATALOG;
}

export function findErrorCatalogEntry(code: string): ErrorCatalogEntry | undefined {
  return ERROR_CATALOG.find((e) => e.code === code);
}

/** Suggested recovery control for Connect Studio error panels. */
export type RecoveryActionId =
  | 'rediscover'
  | 'retry_connect'
  | 'reconnect'
  | 'switch_network'
  | 'open_workarounds'
  | 'install_lace'
  | 'clear_session';

export type RecoveryAction = {
  id: RecoveryActionId;
  label: string;
  hint: string;
  /** Optional in-page hash or external URL the demo may open. */
  href?: string;
};

const ACTION_REDISCOVER: RecoveryAction = {
  id: 'rediscover',
  label: 'Re-discover wallets',
  hint: 'Re-enumerate window.midnight (UUID keys change each load).',
};

const ACTION_RETRY: RecoveryAction = {
  id: 'retry_connect',
  label: 'Retry connect',
  hint: 'Call connect(networkId) again after fixing the issue in Lace.',
};

const ACTION_RECONNECT: RecoveryAction = {
  id: 'reconnect',
  label: 'Reconnect from prefs',
  hint: 'One-click real connect() using the last saved wallet preference.',
};

const ACTION_SWITCH_NETWORK: RecoveryAction = {
  id: 'switch_network',
  label: 'Switch network',
  hint: 'Pick preprod / preview (recommended) then reconnect.',
  href: '#session',
};

const ACTION_WORKAROUNDS: RecoveryAction = {
  id: 'open_workarounds',
  label: 'Open workarounds',
  hint: 'Documented Lace sync / unavailable mitigations.',
  href: '#workarounds',
};

const ACTION_INSTALL: RecoveryAction = {
  id: 'install_lace',
  label: 'Install Lace',
  hint: 'Install Lace with Midnight enabled, then refresh this page.',
  href: 'https://www.lace.io/',
};

const ACTION_CLEAR: RecoveryAction = {
  id: 'clear_session',
  label: 'Clear local session',
  hint: 'Drop the in-page session (prefs kept). Connector has no global disconnect.',
};

/**
 * Map a normalized error to ordered recovery actions for Studio UX.
 * Recoverable codes get retry-oriented actions; non-recoverable get install/docs.
 */
export function recoveryActionsForError(
  error: LaceMidnightKitError | { code: string; recoverable?: boolean },
): RecoveryAction[] {
  const code = error.code;
  switch (code) {
    case KitErrorCodes.NoWindow:
      return [];
    case KitErrorCodes.NoProviders:
      return [ACTION_INSTALL, ACTION_REDISCOVER, ACTION_WORKAROUNDS];
    case KitErrorCodes.ProviderNotFound:
    case KitErrorCodes.DuplicateRdns:
      return [ACTION_REDISCOVER, ACTION_RETRY, ACTION_CLEAR];
    case KitErrorCodes.IncompatibleApiVersion:
      return [ACTION_INSTALL, ACTION_WORKAROUNDS];
    case KitErrorCodes.NetworkMismatch:
      return [ACTION_SWITCH_NETWORK, ACTION_RECONNECT, ACTION_RETRY, ACTION_CLEAR];
    case KitErrorCodes.WalletUnavailable:
    case ErrorCodes.InternalError:
      return [ACTION_WORKAROUNDS, ACTION_RECONNECT, ACTION_RETRY, ACTION_CLEAR];
    case KitErrorCodes.UserCancelled:
    case ErrorCodes.Rejected:
    case ErrorCodes.PermissionRejected:
      return [ACTION_RETRY, ACTION_RECONNECT, ACTION_CLEAR];
    case KitErrorCodes.ConnectionLost:
    case ErrorCodes.Disconnected:
      return [ACTION_RECONNECT, ACTION_REDISCOVER, ACTION_RETRY];
    case ErrorCodes.InvalidRequest:
      return [ACTION_SWITCH_NETWORK, ACTION_WORKAROUNDS, ACTION_CLEAR];
    case KitErrorCodes.Unknown:
    default: {
      const recoverable =
        typeof error.recoverable === 'boolean' ? error.recoverable : true;
      return recoverable
        ? [ACTION_RETRY, ACTION_RECONNECT, ACTION_REDISCOVER, ACTION_WORKAROUNDS]
        : [ACTION_WORKAROUNDS, ACTION_CLEAR];
    }
  }
}
