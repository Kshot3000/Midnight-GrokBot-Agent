import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  clearLacePreferences,
  loadLacePreferences,
  pickPreferredProvider,
  saveDemoModePreference,
  saveNetworkPreference,
  savePreferredWalletRdns,
} from '../dist/preferences.js';

function memoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  };
}

describe('preferences', () => {
  /** @type {ReturnType<typeof memoryStorage>} */
  let store;

  beforeEach(() => {
    store = memoryStorage();
  });

  it('round-trips network + rdns + demo', () => {
    saveNetworkPreference('preprod', store);
    savePreferredWalletRdns('io.lace.midnight', store);
    saveDemoModePreference(true, store);
    const prefs = loadLacePreferences(store);
    assert.equal(prefs.networkId, 'preprod');
    assert.equal(prefs.preferredRdns, 'io.lace.midnight');
    assert.equal(prefs.demoMode, true);
  });

  it('clears all keys', () => {
    saveNetworkPreference('mainnet', store);
    savePreferredWalletRdns('io.lace.midnight', store);
    saveDemoModePreference(true, store);
    clearLacePreferences(store);
    const prefs = loadLacePreferences(store);
    assert.equal(prefs.networkId, null);
    assert.equal(prefs.preferredRdns, null);
    assert.equal(prefs.demoMode, false);
  });

  it('pickPreferredProvider prefers rdns match', () => {
    const providers = [
      { injectionKey: 'a', api: { rdns: 'io.other', name: 'Other', apiVersion: '4.0.1', icon: '', connect: async () => ({}) } },
      { injectionKey: 'b', api: { rdns: 'io.lace.midnight', name: 'Lace', apiVersion: '4.0.1', icon: '', connect: async () => ({}) } },
    ];
    const pick = pickPreferredProvider(providers, 'io.lace.midnight');
    assert.equal(pick?.injectionKey, 'b');
    assert.equal(pickPreferredProvider([], 'io.lace.midnight'), null);
    assert.equal(pickPreferredProvider(providers, null)?.injectionKey, 'a');
  });
});
