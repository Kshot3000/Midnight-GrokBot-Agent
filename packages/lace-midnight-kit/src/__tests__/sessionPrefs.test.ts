import { describe, expect, it, beforeEach } from 'vitest';
import {
  clearSessionPrefs,
  defaultSessionPrefs,
  loadSessionPrefs,
  saveSessionPrefs,
  setPreferredNetwork,
  setPreferredProvider,
  SESSION_PREFS_STORAGE_KEY,
} from '../sessionPrefs.js';
import { MidnightNetworkIds } from '../networks.js';

describe('sessionPrefs', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults and round-trips through localStorage', () => {
    const d = defaultSessionPrefs();
    expect(d.version).toBe(1);
    expect(d.networkId).toBe(MidnightNetworkIds.Preprod);
    expect(loadSessionPrefs().preferredRdns).toBeNull();

    saveSessionPrefs({
      ...d,
      preferredRdns: 'io.lace.midnight',
      preferredInjectionKey: 'uuid-x',
      preferredWalletName: 'Lace',
    });
    const loaded = loadSessionPrefs();
    expect(loaded.preferredRdns).toBe('io.lace.midnight');
    expect(loaded.preferredInjectionKey).toBe('uuid-x');
  });

  it('setPreferredNetwork and clear', () => {
    setPreferredNetwork(MidnightNetworkIds.Preview);
    expect(loadSessionPrefs().networkId).toBe(MidnightNetworkIds.Preview);
    setPreferredProvider({ rdns: 'io.lace.midnight', walletName: 'Lace' });
    expect(loadSessionPrefs().preferredWalletName).toBe('Lace');
    clearSessionPrefs();
    expect(localStorage.getItem(SESSION_PREFS_STORAGE_KEY)).toBeNull();
  });
});
