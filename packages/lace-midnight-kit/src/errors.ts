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
