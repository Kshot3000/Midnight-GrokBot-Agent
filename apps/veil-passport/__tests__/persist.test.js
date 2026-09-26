import { describe, expect, it, beforeEach } from 'vitest';
import {
  loadStudioState,
  saveStudioState,
  clearStudioState,
  exportStudioJSON,
  importStudioJSON,
} from '../persist.mjs';
import { STORAGE_KEY, SCHEMA_VERSION } from '../passport-core.mjs';

function memoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  };
}

describe('persist', () => {
  /** @type {ReturnType<typeof memoryStorage>} */
  let store;

  beforeEach(() => {
    store = memoryStorage();
  });

  it('save/load/clear round-trip', () => {
    saveStudioState(
      {
        passports: [
          {
            id: 'pp_1',
            displayName: 'Moon',
            age: 30,
            role: 'builder',
            membership: 'night',
            salt: 's',
            commit: 'c',
            issuerSig: 'i',
            issuedAt: 't',
            presented: false,
            revoked: false,
            disclosed: [],
          },
        ],
        activeId: 'pp_1',
      },
      STORAGE_KEY,
      store,
    );
    const loaded = loadStudioState(STORAGE_KEY, store);
    expect(loaded.passports[0].displayName).toBe('Moon');
    expect(loaded.schemaVersion).toBe(SCHEMA_VERSION);
    clearStudioState(STORAGE_KEY, store);
    expect(loadStudioState(STORAGE_KEY, store).passports).toHaveLength(0);
  });

  it('export then import', () => {
    const json = exportStudioJSON({
      passports: [
        {
          id: '1',
          displayName: 'x',
          age: 21,
          role: 'r',
          membership: 'm',
          salt: 's',
          commit: 'c',
          issuerSig: 'i',
          issuedAt: 't',
          presented: true,
          revoked: false,
          disclosed: ['age'],
        },
      ],
      activeId: '1',
    });
    const result = importStudioJSON(json);
    expect(result.ok).toBe(true);
    expect(result.state.passports).toHaveLength(1);
  });

  it('migrates legacy bare array', () => {
    store.setItem(STORAGE_KEY, JSON.stringify([{ id: 'legacy', displayName: 'L', age: 1, role: 'r', membership: 'm', salt: 's', commit: 'c' }]));
    const loaded = loadStudioState(STORAGE_KEY, store);
    expect(loaded.passports[0].id).toBe('legacy');
    expect(loaded.schemaVersion).toBe(SCHEMA_VERSION);
  });
});
