import { describe, expect, it, beforeEach } from 'vitest';
import {
  loadStudioState,
  saveStudioState,
  clearStudioState,
  exportStudioJSON,
  importStudioJSON,
  saveDraft,
  loadDraft,
} from '../persist.mjs';
import { STORAGE_KEY, DRAFT_KEY, SCHEMA_VERSION } from '../market-core.mjs';

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
    saveStudioState({ listings: [{ id: 'l1', title: 'T', reserve: 1, commitment: 'c', disclosure: 'sealed', status: 'open', bids: [] }], draft: null }, STORAGE_KEY, store);
    const loaded = loadStudioState(STORAGE_KEY, store);
    expect(loaded.listings.length).toBe(1);
    expect(loaded.schemaVersion).toBe(SCHEMA_VERSION);
    clearStudioState(STORAGE_KEY, store);
    expect(loadStudioState(STORAGE_KEY, store).listings).toEqual([]);
  });

  it('migrates legacy bare array', () => {
    const arr = [{ id: 'x', title: 't', commitment: 'c', disclosure: 'sealed', bids: [] }];
    store.setItem(STORAGE_KEY, JSON.stringify(arr));
    const loaded = loadStudioState(STORAGE_KEY, store);
    expect(loaded.listings.length).toBe(1);
    expect(loaded.schemaVersion).toBe(SCHEMA_VERSION);
  });

  it('export then import', () => {
    const json = exportStudioJSON({ listings: [{ id: 'l1', title: 'T', reserve: 1, commitment: 'c', disclosure: 'sealed', status: 'open', bids: [] }], draft: null });
    const result = importStudioJSON(json);
    expect(result.ok).toBe(true);
    expect(result.state.listings).toHaveLength(1);
  });

  it('draft save/load', () => {
    saveDraft({ commitment: 'abc', salt: 's' }, store);
    expect(loadDraft(store).commitment).toBe('abc');
    saveDraft(null, store);
    expect(loadDraft(store)).toBe(null);
  });

  it('loadDraft never returns a verbatim hostile draft', () => {
    // Written straight into storage, bypassing saveDraft (crafted blob).
    store.setItem(DRAFT_KEY, JSON.stringify({ commitment: 'abc', reserve: 'evil-string' }));
    const draft = loadDraft(store);
    expect(typeof draft.reserve).toBe('number');
    expect(draft.reserve).toBe(0);
    store.setItem(DRAFT_KEY, '{"commitment":"abc","reserve":1e999}');
    expect(loadDraft(store).reserve).toBe(0);
    store.setItem(DRAFT_KEY, JSON.stringify({ reserve: 5 }));
    expect(loadDraft(store)).toBe(null);
  });
});
