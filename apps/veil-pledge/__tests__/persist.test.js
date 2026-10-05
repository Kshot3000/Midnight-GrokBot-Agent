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
import { STORAGE_KEY, SCHEMA_VERSION } from '../pledge-core.mjs';

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
    saveStudioState({ pledges: [{ id: 'p1', commitment: 'c', amount: 2, disclosure: 'sealed' }], draft: null }, STORAGE_KEY, store);
    const loaded = loadStudioState(STORAGE_KEY, store);
    expect(loaded.pledges.length).toBe(1);
    expect(loaded.schemaVersion).toBe(SCHEMA_VERSION);
    clearStudioState(STORAGE_KEY, store);
    expect(loadStudioState(STORAGE_KEY, store).pledges).toEqual([]);
  });

  it('migrates legacy bare array', () => {
    const arr = [{ id: 'x', commitment: 'c', amount: 1, disclosure: 'sealed' }];
    store.setItem(STORAGE_KEY, JSON.stringify(arr));
    const loaded = loadStudioState(STORAGE_KEY, store);
    expect(loaded.pledges.length).toBe(1);
    expect(loaded.schemaVersion).toBe(SCHEMA_VERSION);
  });

  it('export then import', () => {
    const json = exportStudioJSON({ pledges: [{ id: 'p1', commitment: 'c', amount: 2, disclosure: 'sealed' }], draft: null });
    const result = importStudioJSON(json);
    expect(result.ok).toBe(true);
    expect(result.state.pledges).toHaveLength(1);
  });

  it('draft save/load', () => {
    saveDraft({ commitment: 'abc', salt: 's' }, store);
    expect(loadDraft(store).commitment).toBe('abc');
    saveDraft(null, store);
    expect(loadDraft(store)).toBe(null);
  });

  it('loadDraft normalizes a hostile stored draft instead of returning it verbatim', () => {
    store.setItem('mn-veil-pledge-draft-v1', JSON.stringify({ commitment: 'c', amount: '50', salt: 123 }));
    const draft = loadDraft(store);
    expect(draft.amount).toBe(50);
    expect(typeof draft.amount).toBe('number');
    expect(draft.salt).toBe('123');
    // A draft without a commitment is not a draft
    store.setItem('mn-veil-pledge-draft-v1', JSON.stringify({ amount: 5 }));
    expect(loadDraft(store)).toBe(null);
  });
});
