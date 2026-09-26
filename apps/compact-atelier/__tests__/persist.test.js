import { describe, expect, it, beforeEach } from 'vitest';
import {
  loadStudioState,
  saveStudioState,
  clearStudioState,
  exportStudioJSON,
  importStudioJSON,
} from '../persist.mjs';
import { STORAGE_KEY, SCHEMA_VERSION } from '../atelier-core.mjs';

function memoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  };
}

describe('persist', () => {
  let store;
  beforeEach(() => {
    store = memoryStorage();
  });

  it('save/load/clear round-trip', () => {
    saveStudioState(
      {
        lessonId: 'hello-counter',
        source: 'x',
        baselineSource: 'x',
        explained: false,
        linted: true,
      },
      STORAGE_KEY,
      store,
    );
    const loaded = loadStudioState(STORAGE_KEY, store);
    expect(loaded.lessonId).toBe('hello-counter');
    expect(loaded.linted).toBe(true);
    expect(loaded.schemaVersion).toBe(SCHEMA_VERSION);
    clearStudioState(STORAGE_KEY, store);
    expect(loadStudioState(STORAGE_KEY, store).lessonId).toBe(null);
  });

  it('export then import', () => {
    const json = exportStudioJSON({
      lessonId: 'hello-counter',
      source: 'draft',
      baselineSource: 'base',
      explained: true,
      linted: false,
    });
    const result = importStudioJSON(json);
    expect(result.ok).toBe(true);
    expect(result.state.source).toBe('draft');
  });
});
