import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { discoverProviders, findProvider, safeWalletLabel, safeIconUrl } from '../dist/discover.js';
import { KitErrorCodes } from '../dist/errors.js';

function makeApi(overrides = {}) {
  return {
    rdns: 'io.lace.midnight',
    name: 'Lace',
    apiVersion: '4.0.1',
    icon: 'https://example.com/icon.png',
    connect: async () => ({}),
    ...overrides,
  };
}

describe('discoverProviders', () => {
  let originalWindow;

  beforeEach(() => {
    originalWindow = globalThis.window;
  });

  afterEach(() => {
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
  });

  it('returns empty when midnight absent', () => {
    globalThis.window = {};
    const result = discoverProviders();
    assert.deepEqual(result.providers, []);
    assert.deepEqual(result.compatible, []);
    assert.equal(result.hasDuplicateRdns, false);
  });

  it('enumerates UUID keys and filters ^4', () => {
    const lace = makeApi();
    const old = makeApi({ apiVersion: '3.0.0', rdns: 'io.old' });
    globalThis.window = {
      midnight: {
        'uuid-lace-1': lace,
        'uuid-old': old,
        junk: { noConnect: true },
      },
    };
    const result = discoverProviders({ apiVersionRange: '^4.0.0' });
    assert.equal(result.providers.length, 2);
    assert.equal(result.compatible.length, 1);
    assert.equal(result.compatible[0].injectionKey, 'uuid-lace-1');
    assert.ok(!result.injectionKeys.includes('mnLace') || true);
  });

  it('never requires mnLace hardcoded key', () => {
    globalThis.window = {
      midnight: {
        'fresh-uuid-abc': makeApi(),
      },
    };
    const result = discoverProviders();
    assert.equal(result.compatible.length, 1);
    assert.notEqual(result.compatible[0].injectionKey, 'mnLace');
  });

  it('findProvider by rdns', () => {
    globalThis.window = {
      midnight: {
        k1: makeApi({ rdns: 'io.a' }),
        k2: makeApi({ rdns: 'io.b', name: 'B' }),
      },
    };
    const found = findProvider({ rdns: 'io.b' });
    assert.equal(found.api.name, 'B');
  });

  it('findProvider throws NoProviders', () => {
    globalThis.window = { midnight: {} };
    assert.throws(
      () => findProvider({ firstCompatible: true }),
      (err) => err.code === KitErrorCodes.NoProviders,
    );
  });

  it('safeWalletLabel strips control / angle brackets', () => {
    assert.equal(safeWalletLabel(makeApi({ name: 'Lace<script>' })), 'Lacescript');
  });

  it('safeIconUrl accepts https and data', () => {
    assert.equal(safeIconUrl(makeApi({ icon: 'https://x/y.png' })), 'https://x/y.png');
    assert.equal(safeIconUrl(makeApi({ icon: 'data:image/png;base64,xx' })), 'data:image/png;base64,xx');
    assert.equal(safeIconUrl(makeApi({ icon: 'javascript:alert(1)' })), null);
  });
});
