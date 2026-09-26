import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  KitErrorCodes,
  LaceMidnightKitError,
  normalizeConnectorError,
  userHintForError,
} from '../dist/errors.js';

describe('normalizeConnectorError', () => {
  it('maps wallet unavailable string', () => {
    const e = normalizeConnectorError(new Error('Wallet is unavailable'));
    assert.equal(e.code, KitErrorCodes.WalletUnavailable);
    assert.equal(e.recoverable, true);
  });
  it('passes through kit errors', () => {
    const orig = new LaceMidnightKitError(KitErrorCodes.NoProviders, 'none');
    assert.equal(normalizeConnectorError(orig), orig);
  });
  it('user hints for NoProviders', () => {
    const e = new LaceMidnightKitError(KitErrorCodes.NoProviders, 'x', { recoverable: true });
    assert.match(userHintForError(e), /Install Lace/i);
  });
});
