import { describe, expect, it } from 'vitest';
import {
  KitErrorCodes,
  LaceMidnightKitError,
  normalizeConnectorError,
  userHintForError,
} from '../errors.js';

describe('errors', () => {
  it('maps wallet unavailable strings', () => {
    const e = normalizeConnectorError(new Error('Wallet is unavailable'));
    expect(e.code).toBe(KitErrorCodes.WalletUnavailable);
    expect(e.recoverable).toBe(true);
    expect(userHintForError(e).toLowerCase()).toContain('unavailable');
  });

  it('preserves LaceMidnightKitError', () => {
    const orig = new LaceMidnightKitError(KitErrorCodes.NoProviders, 'none', {
      recoverable: true,
    });
    expect(normalizeConnectorError(orig)).toBe(orig);
  });
});
