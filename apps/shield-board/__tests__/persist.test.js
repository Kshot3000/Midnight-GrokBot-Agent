import { describe, expect, it, beforeEach } from 'vitest';
import {
  loadStudioState,
  saveStudioState,
  clearStudioState,
  exportStudioJSON,
  importStudioJSON,
  LEGACY_STORAGE_KEY,
} from '../persist.mjs';
import { STORAGE_KEY } from '../board-core.mjs';

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
        secret: 'deadbeef'.repeat(8),
        seq: 1,
        posts: [{ id: 'x', commitment: 'c', ownerPk: 'p', seq: 0, createdAt: 1, disclosed: false }],
        log: ['hi'],
      },
      STORAGE_KEY,
      store,
    );
    const loaded = loadStudioState(STORAGE_KEY, store, { legacyKey: false });
    expect(loaded.posts).toHaveLength(1);
    expect(loaded.schemaVersion).toBe(2);
    clearStudioState(STORAGE_KEY, store, { legacyKey: false });
    expect(loadStudioState(STORAGE_KEY, store, { legacyKey: false }).posts).toEqual([]);
  });

  it('migrates legacy key', () => {
    store.setItem(
      LEGACY_STORAGE_KEY,
      JSON.stringify({
        secret: 'legacy-secret',
        seq: 3,
        posts: [],
        log: ['old'],
      }),
    );
    const loaded = loadStudioState(STORAGE_KEY, store);
    expect(loaded.secret).toBe('legacy-secret');
    expect(loaded.seq).toBe(3);
    expect(store.getItem(STORAGE_KEY)).toBeTruthy();
  });

  it('export then import', () => {
    const json = exportStudioJSON({
      secret: 's',
      seq: 0,
      posts: [{ id: '1', commitment: 'c', ownerPk: 'o', seq: 0, createdAt: 1, disclosed: true, body: 'b' }],
      log: [],
    });
    const result = importStudioJSON(json);
    expect(result.ok).toBe(true);
    expect(result.state.posts[0].body).toBe('b');
  });
});
