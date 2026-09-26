import { describe, expect, it, beforeEach } from 'vitest';
import {
  loadStudioState,
  saveStudioState,
  clearStudioState,
  exportStudioJSON,
  importStudioJSON,
} from '../persist.mjs';
import {
  STORAGE_KEY,
  SCHEMA_VERSION,
  LEGACY_SK_KEY,
  LEGACY_POSTS_KEY,
  LEGACY_SCORE_KEY,
} from '../auth-core.mjs';

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
        sk: '11'.repeat(32),
        posts: [{ id: '1', seq: 1, body: 'note', ownerPk: '22'.repeat(32), ts: 1 }],
        score: { s1: true },
        forge: { phase: 'idle' },
      },
      STORAGE_KEY,
      store,
    );
    const loaded = loadStudioState(STORAGE_KEY, store);
    expect(loaded.posts[0].body).toBe('note');
    expect(loaded.schemaVersion).toBe(SCHEMA_VERSION);
    clearStudioState(STORAGE_KEY, store);
    expect(loadStudioState(STORAGE_KEY, store).posts).toHaveLength(0);
  });

  it('export then import', () => {
    const json = exportStudioJSON({
      sk: '33'.repeat(32),
      posts: [{ id: '2', seq: 1, body: 'x', ownerPk: '44'.repeat(32), ts: 2 }],
      score: { s2: true },
    });
    const result = importStudioJSON(json);
    expect(result.ok).toBe(true);
    expect(result.state.posts).toHaveLength(1);
    expect(result.state.score.s2).toBe(true);
  });

  it('migrates legacy split keys', () => {
    store.setItem(LEGACY_SK_KEY, '55'.repeat(32));
    store.setItem(
      LEGACY_POSTS_KEY,
      JSON.stringify([{ id: 'L', seq: 1, body: 'legacy', ownerPk: '66'.repeat(32), ts: 3 }]),
    );
    store.setItem(LEGACY_SCORE_KEY, JSON.stringify({ s1: true }));
    const loaded = loadStudioState(STORAGE_KEY, store);
    expect(loaded.sk).toBe('55'.repeat(32));
    expect(loaded.posts[0].body).toBe('legacy');
    expect(loaded.score.s1).toBe(true);
    expect(loaded.schemaVersion).toBe(SCHEMA_VERSION);
    // upgraded into unified key
    expect(store.getItem(STORAGE_KEY)).toBeTruthy();
  });
});
