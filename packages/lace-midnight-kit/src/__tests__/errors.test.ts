import { describe, expect, it } from 'vitest';
import {
  KitErrorCodes,
  LaceMidnightKitError,
  ERROR_CATALOG,
  listErrorCatalog,
  findErrorCatalogEntry,
  normalizeConnectorError,
  userHintForError,
} from '../errors.js';
import { LACE_INSTALL_GUIDE, formatInstallGuideMarkdown } from '../installGuide.js';

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

  it('exposes a non-empty error catalog with hints', () => {
    expect(listErrorCatalog().length).toBeGreaterThan(5);
    expect(ERROR_CATALOG.some((e) => e.code === KitErrorCodes.NoProviders)).toBe(true);
    const row = findErrorCatalogEntry(KitErrorCodes.WalletUnavailable);
    expect(row?.recoverable).toBe(true);
    expect(row?.hint.toLowerCase()).toContain('unavailable');
  });

  it('hints ProviderNotFound', () => {
    const e = new LaceMidnightKitError(KitErrorCodes.ProviderNotFound, 'gone');
    expect(userHintForError(e).toLowerCase()).toContain('re-discover');
  });
});

describe('installGuide', () => {
  it('has ordered install steps and markdown export', () => {
    expect(LACE_INSTALL_GUIDE.steps.length).toBeGreaterThanOrEqual(4);
    expect(LACE_INSTALL_GUIDE.steps[0].id).toBe('install');
    const md = formatInstallGuideMarkdown();
    expect(md).toContain('Install Lace');
    expect(md).toContain('Not claimed');
  });
});
