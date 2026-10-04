import { describe, expect, it, beforeEach } from 'vitest';
import { discoverProviders, findProvider, safeWalletLabel } from '../discover.js';

function mockProvider(overrides: Partial<{
  name: string;
  rdns: string;
  apiVersion: string;
  icon: string;
}> = {}) {
  return {
    name: overrides.name ?? 'Lace',
    rdns: overrides.rdns ?? 'io.lace.midnight',
    apiVersion: overrides.apiVersion ?? '4.0.1',
    icon: overrides.icon ?? 'data:image/png;base64,aaa',
    connect: async () => {
      throw new Error('not used in discover');
    },
  };
}

describe('discoverProviders', () => {
  beforeEach(() => {
    // @ts-expect-error test mock
    delete window.midnight;
  });

  it('returns empty when window.midnight absent', () => {
    const r = discoverProviders();
    expect(r.providers).toEqual([]);
    expect(r.compatible).toEqual([]);
    expect(r.injectionKeys).toEqual([]);
  });

  it('enumerates UUID keys and filters by ^4.0.0', () => {
    const key = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    // @ts-expect-error test mock
    window.midnight = {
      [key]: mockProvider(),
      junk: { name: 'x' },
    };
    const r = discoverProviders({ apiVersionRange: '^4.0.0' });
    expect(r.injectionKeys).toContain(key);
    expect(r.providers).toHaveLength(1);
    expect(r.compatible).toHaveLength(1);
    expect(r.compatible[0]!.injectionKind).toBe('v4');
    expect(safeWalletLabel(r.compatible[0]!.api)).toBe('Lace');
  });

  it('keeps friendly keys mnLace and 1am next to v4 keys', () => {
    // @ts-expect-error test mock
    window.midnight = {
      mnLace: mockProvider({ name: 'Lace', rdns: 'io.lace.midnight' }),
      '1am': mockProvider({ name: '1AM', rdns: 'xyz.1am.midnight' }),
      'uuid-1': mockProvider({ name: 'Other', rdns: 'example.wallet' }),
    };
    const r = discoverProviders();
    const byKey = Object.fromEntries(r.compatible.map((p) => [p.injectionKey, p.injectionKind]));
    expect(byKey).toEqual({ mnLace: 'friendly', '1am': 'friendly', 'uuid-1': 'v4' });
    const lace = findProvider({ injectionKey: 'mnLace' });
    expect(lace.api.name).toBe('Lace');
  });

  it('finds by rdns', () => {
    const key = 'uuid-1';
    // @ts-expect-error test mock
    window.midnight = { [key]: mockProvider({ rdns: 'io.lace.midnight' }) };
    const p = findProvider({ rdns: 'io.lace.midnight' });
    expect(p.injectionKey).toBe(key);
  });

  it('rejects incompatible api versions from compatible list', () => {
    // @ts-expect-error test mock
    window.midnight = {
      a: mockProvider({ apiVersion: '3.0.0' }),
    };
    const r = discoverProviders({ apiVersionRange: '^4.0.0' });
    expect(r.providers).toHaveLength(1);
    expect(r.compatible).toHaveLength(0);
  });
});
